import {
  SSMClient,
  GetParametersByPathCommand,
  GetParametersByPathCommandOutput,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";

const REGION = "us-east-1"; // change to your region
const PARAMETER_PATH = "/payrit/preprod/"; // change to your app path

const ssm = new SSMClient({ region: REGION });

async function migrateToSecureString(dryRun: boolean) {
  console.log(`🔎 Fetching parameters from ${PARAMETER_PATH}`);

  let nextToken: string | undefined = undefined;
  let totalProcessed = 0;

  do {
    const command = new GetParametersByPathCommand({
      Path: PARAMETER_PATH,
      Recursive: true,
      WithDecryption: true,
      NextToken: nextToken,
    });

    const response: GetParametersByPathCommandOutput = await ssm.send(command);

    if (!response.Parameters || response.Parameters.length === 0) {
      console.log("⚠️ No parameters found in this batch.");
      break;
    }

    for (const param of response.Parameters) {
      totalProcessed++;
      console.log(`➡️ Found ${param.Name} (Type: ${param.Type})`);

      if (dryRun) {
        console.log(`   🟡 Would convert ${param.Name} to SecureString`);
      } else {
        const putCommand = new PutParameterCommand({
          Name: param.Name,
          Value: param.Value!,
          Type: "SecureString",
          Overwrite: true,
        });

        await ssm.send(putCommand);
        console.log(`   ✅ Converted ${param.Name} to SecureString`);
      }
    }

    nextToken = response.NextToken; // ✅ Correct property name
  } while (nextToken);

  console.log(
    dryRun
      ? `🟡 Dry-run complete. Total parameters scanned: ${totalProcessed}`
      : `🎉 Migration complete! Total parameters converted: ${totalProcessed}`
  );
}

// Check CLI arg: --dry-run
const dryRun = process.argv.includes("--dry-run");

migrateToSecureString(dryRun).catch((err) => {
  console.error("❌ Migration failed:", err);
});
