import type { NextApiRequest, NextApiResponse } from 'next'

function uuid(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.writeHead(200, {
    'Content-Type': 'application/xml'
  });
  res.end(`
    <security>
      <hash>${uuid(98)}</hash>
    </security>
  `)
};
