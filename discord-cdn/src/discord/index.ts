import 'dotenv';
import fetch from 'node-fetch';
import {type} from '../@type-api'
import { DataLike, HttpClient, HttpMethod, middleware } from '@augu/orchid';
import { RestClient, CDN, RestClientOptions } from '@wumpcord/rest';

export const RegisterVersion = type.init(10);

type options = {
  body?: any;
  headers?: any;
  files?: any;
};
 
export class Discord {
  token: string;
  constructor(token: string) {
    if (!token.startsWith('Bot')) {
      this.token = `Bot ${token}`;
    } else {
      this.token = token;
    }
  }

  public async rest(endpoint: string, option: options, method: string) {
    if (option.body) option.body = JSON.stringify(option.body);
    if (option.files) {
      (new RestClient({ token: this.token.replace('Bot ', '') }))
        .dispatch({
          method: method as HttpMethod,
          endpoint: endpoint,
          file: {
            file: option.files,
            name: 'file.png',
          }
        })

    } else {
      await fetch(`${RegisterVersion}/${endpoint}`, {
        headers: {
          Authorization: this.token,
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent': 'Shartube (https://github.com/Folody-Team/Shartube, 1.0.0)',
        },
        
        method: method,
        ...option
      });
    }
  }
}