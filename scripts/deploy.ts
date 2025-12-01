import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Deploying EmotionTracker contract to Celo Alfajores...");

    // Get the contract factory
    const EmotionTracker = await ethers.getContractFactory("EmotionTracker");

    // Deploy the contract
    console.log("📝 Deploying contract...");
    const emotionTracker = await EmotionTracker.deploy();

    await emotionTracker.waitForDeployment();

    const contractAddress = await emotionTracker.getAddress();

    console.log("✅ EmotionTracker deployed to:", contractAddress);

    // Save the contract address to a JSON file
    const deploymentInfo = {
        EmotionTracker: contractAddress,
        network: "alfajores",
        deployedAt: new Date().toISOString(),
    };

    const deploymentPath = path.join(__dirname, "../client/src/contracts/deployed-addresses.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("💾 Contract address saved to:", deploymentPath);

    // Wait for a few block confirmations
    console.log("⏳ Waiting for block confirmations...");
    await emotionTracker.deploymentTransaction()?.wait(5);

    console.log("🎉 Deployment complete!");
    console.log("\n📋 Deployment Summary:");
    console.log("   Contract Address:", contractAddress);
    console.log("   Network: Celo Alfajores");
    console.log("   Explorer:", `https://alfajores.celoscan.io/address/${contractAddress}`);
    console.log("\n💡 Next steps:");
    console.log("   1. Verify contract: npx hardhat verify --network alfajores", contractAddress);
    console.log("   2. The contract address has been automatically saved to the app");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
