import { serverEnv } from "@/env/serverEnv";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import "dotenv/config";

type Bucket = string;
type Key = string;

const s3 = new S3Client({ forcePathStyle: true });

type GetObjectUrlParams = { bucket: Bucket; key: Key };

function getObjectUrl({ bucket, key }: GetObjectUrlParams) {
  return `${serverEnv.NEXT_AWS_ENDPOINT_URL_S3}/${bucket}/${key}`;
}

type UploadObjectParams = {
  bucket: Bucket;
  key: Key;
  body: Buffer;
  contentType?: string;
};

async function uploadObject({
  body,
  bucket,
  key,
  contentType,
}: UploadObjectParams) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return getObjectUrl({ bucket, key });
}

type DeleteObjectParams = { bucket: Bucket; key: Key };

async function deleteObject({ bucket, key }: DeleteObjectParams) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export { deleteObject, uploadObject };
