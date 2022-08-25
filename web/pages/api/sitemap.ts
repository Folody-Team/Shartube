import {SitemapStream, streamToPromise} from 'sitemap';
import type { NextApiRequest, NextApiResponse } from 'next'
import {Readable} from 'stream';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const links = [
    { url: '/', changefreq: 'daily', priority: 0.3 },
    { url: '/', changefreq: 'monthly', priority: 0.7 },
  ];

  const smStream = new SitemapStream({hostname: `http://${req.headers.host}`});

  res.writeHead(200, {
    'Content-Type': 'application/xml'
  });
  
  const xml = await streamToPromise(Readable.from(links).pipe(smStream)).then(data => data.toString());
  res.end(xml);
}

