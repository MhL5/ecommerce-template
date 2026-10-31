import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ forcePathStyle: true });
const bucket = "assets";
const key = "uploads/file.txt";

await s3.send(
  new PutObjectCommand({ Bucket: bucket, Key: key, Body: "Hello World!" }),
);

const url = await getSignedUrl(
  s3,
  new GetObjectCommand({ Bucket: bucket, Key: key }),
  { expiresIn: 3600 },
);

export { url };
