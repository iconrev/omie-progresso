import { Storage } from "aws-amplify";

export async function s3Upload(file, filename) {
    const stored = await Storage.vault.put(filename, file, {
        contentType: file.type,
        level: 'public'
    });
    return stored.key;
}

export default s3Upload;