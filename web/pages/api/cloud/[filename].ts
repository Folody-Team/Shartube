import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { filename } = req.query;
  fs.readFile(`./res/${filename}`, (err, data) => {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.write(data);
    return res.end();
  })
};
