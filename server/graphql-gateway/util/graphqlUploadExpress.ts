import express from "express";
import createError from "http-errors";
import Upload from "./Upload";
import GRAPHQL_MULTIPART_REQUEST_SPEC_URL from "./GRAPHQL_MULTIPART_REQUEST_SPEC_URL";
import ignoreStream from "./ignoreStream";
import { Readable } from "stream";
import { WriteStream } from "./fs-capacitor";

interface graphqlUploadExpressOptions {
  maxFieldSize?: number;
  maxFiles?: number;
  maxFilesSize?: number;
}
function deepSet(object: any, path: string, value?: Upload) {
  const parts = path.split(".");
  const last = parts.pop() as string;
  const obj = parts.reduce((obj, part) => obj[part] as any, object);
  obj[last] = value;
}

const defaultOptions: Required<graphqlUploadExpressOptions> = {
  maxFieldSize: 10000000,
  maxFiles: Infinity,
  maxFilesSize: Infinity,
};

export const graphqlUploadExpress = (
  optionsInput: graphqlUploadExpressOptions = {}
) => {
  const options = {
    ...defaultOptions,
    ...optionsInput,
  };
  return async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    if (!request.is("multipart/form-data")) return next();
    // console.log("request.headers", request.headers);
    // console.log("request.body", request.body);
    // console.log("request.files", request.files);
    try {
      const body = await processRequest(request, response, options);
      request.body = { ...request.body, ...body };
    } catch (error: any) {
      response.status(error.status);
      next(error);
    }
    next();
  };
};
function isObject(val: any) {
  return val != null && typeof val === "object" && Array.isArray(val) === false;
}
function processRequest(
  request: express.Request,
  response: express.Response,
  {
    maxFieldSize,
    maxFiles,
    maxFilesSize,
  }: Required<graphqlUploadExpressOptions>
) {
  return new Promise<any>((resolve, reject) => {
    const exit = (status: number, message: string) => {
      reject(createError(status, message));
    };
    let operations;
    let map;
    try {
      operations = JSON.parse(request.body.operations);
    } catch (error) {
      return exit(
        400,
        `Invalid JSON in the 'operations' multipart field (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      );
    }
    if (!isObject(operations)) {
      return exit(
        400,
        `Invalid type for the 'operations' multipart field (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      );
    }
    if (!operations) {
      return exit(
        400,
        `Missing 'operations' multipart field (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      );
    }
    let parsedMap: { [key: string]: string[] };
    try {
      parsedMap = JSON.parse(request.body.map);
    } catch (error) {
      return exit(
        400,
        `Invalid JSON in the 'map' multipart field (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      );
    }

    if (!isObject(parsedMap))
      return exit(
        400,
        `Invalid type for the 'map' multipart field (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      );
    const mapEntries = Object.entries(parsedMap);
    if (mapEntries.length > maxFiles)
      return exit(413, `${maxFiles} max file uploads exceeded.`);
    map = new Map<string, Upload>();
    for (const [key, value] of mapEntries) {
      if (!Array.isArray(value)) {
        return exit(
          400,
          `Invalid type for the 'map' multipart field entry key '${key}' array (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
        );
      }

      map.set(key, new Upload());
      for (const [index, field] of value.entries()) {
        if (typeof field !== "string" || !field.trim().length) {
          return exit(
            400,
            `Invalid type for the 'map' multipart field entry key '${key}' array entry '${index}' (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
          );
        }
        try {
          deepSet(operations, field, map.get(key));
        } catch (error) {
          return exit(
            400,
            `Invalid object path for the 'map' multipart field entry key '${key}' array index '${index}' value '${field}' (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
          );
        }
      }
    }

    let lastFileStream;
    let returnedStreams = new Set();
    if (!request.files) {
      return resolve(operations);
    }
    if (!map) {
      return exit(
        400,
        `Misordered multipart fields; files should follow 'map' (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      );
    }
    const files = request.files;
    const filesEntries = Object.entries(files);
    if (filesEntries.length > maxFiles)
      return exit(413, `${maxFiles} max file uploads exceeded.`);
    for (const [key, value] of filesEntries) {
      // if (!Array.isArray(value)) {
      //   return exit(
      //     400,
      //     `Invalid type for the 'files' multipart field entry key '${key}' array (${GRAPHQL_MULTIPART_REQUEST_SPEC_URL}).`
      //   );
      // }
      const upload = map.get(key);
      if (!upload) {
        return;
      }
      const file = {
        fieldName: key,
        filename: value.originalname,
        mimetype: value.mimetype,
        encoding: value.encoding,
        createReadStream: () => {
          const stream = Readable.from(value.buffer);

          returnedStreams.add(stream);
          return stream;
        },
      };
      upload.resolve(file);
    }
    resolve({
      ...operations,
    });
  });
}
