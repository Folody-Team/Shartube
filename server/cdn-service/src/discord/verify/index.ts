import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey: string) {
  return function (req: any, res: any, buf: any, encoding: any) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}