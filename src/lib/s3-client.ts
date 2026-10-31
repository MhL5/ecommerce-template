import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverEnv } from "@/env/serverEnv";

const DEFAULT_URL_EXPIRY_SECONDS = 3600;

let client: S3Client | undefined;

function getClient() {
  client ??= new S3Client({
    endpoint: serverEnv.S3_ENDPOINT,
    region: serverEnv.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: serverEnv.S3_ACCESS_KEY_ID,
      secretAccessKey: serverEnv.S3_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

async function uploadObject(
  key: string,
  body: Uint8Array | string,
  contentType?: string,
) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: serverEnv.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

function getObjectUrl(
  key: string,
  expiresInSeconds = DEFAULT_URL_EXPIRY_SECONDS,
) {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: serverEnv.S3_BUCKET, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

async function deleteObject(key: string) {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: serverEnv.S3_BUCKET, Key: key }),
  );
}

export { deleteObject, getObjectUrl, uploadObject };
