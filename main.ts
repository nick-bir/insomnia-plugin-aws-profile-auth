import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { AwsCredentialIdentity } from "@smithy/types/dist-types/identity/awsCredentialIdentity";

export const requestHooks = [
  async (context: Context) => {
    const awsProfile = await context.store.getItem("awsProfile");
    if (!awsProfile) {
      return null;
    }
    const credsStr = await context.store.getItem("awsCreds");
    let creds: AwsCredentialIdentity = JSON.parse(
      credsStr,
    ) as AwsCredentialIdentity;

    if (
      creds.expiration &&
      creds.expiration.valueOf() <= new Date().valueOf()
    ) {
      creds = await updateCreds(context, awsProfile);
    }
    console.log(credsStr);
    context.request.setAuthenticationParameter("type", "iam");
    context.request.setAuthenticationParameter(
      "accessKeyId",
      creds.accessKeyId,
    );
    context.request.setAuthenticationParameter(
      "secretAccessKey",
      creds.secretAccessKey,
    );
    context.request.setAuthenticationParameter(
      "sessionToken",
      creds.sessionToken,
    );
  },
];

export const requestActions = [
  {
    label: "Set AWS profile",
    action: async (context: Context) => {
      const profile = await context.app.prompt(
        "Please enter AWS profile to use for ALL requests",
      );
      await context.store.setItem("awsProfile", profile);
      await updateCreds(context, profile);
    },
  },
  {
    label: "Clear AWS profile",
    action: async (context: Context) => {
      await context.store.removeItem("awsProfile");
      await context.app.alert(
        "AWS profile removed. Future requests will not use plugin",
      );
    },
  },
];

async function updateCreds(context: Context, profile: string) {
  const credsProvider = await fromNodeProviderChain({ profile });
  const creds = await credsProvider();
  await context.store.setItem("awsCreds", JSON.stringify(creds));
  return creds;
}
