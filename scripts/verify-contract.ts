import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0xCb58025C1833e0F30C26A9772Ee401B578c3F02f";

    console.log("🔍 Checking contract at:", contractAddress);

    // Get the contract factory
    const EmotionTracker = await ethers.getContractFactory("EmotionTracker");

    // Attach to the deployed contract
    const contract = EmotionTracker.attach(contractAddress);

    try {
        // Try calling getUserBalance (new function)
        console.log("\n✅ Testing getUserBalance...");
        const balance = await contract.getUserBalance("0x0000000000000000000000000000000000000000");
        console.log("   Result:", balance.toString());
    } catch (e: any) {
        console.log("   ❌ Error:", e.message);
    }

    try {
        // Try calling getRecentPublicEmotions (new function)
        console.log("\n✅ Testing getRecentPublicEmotions...");
        const emotions = await contract.getRecentPublicEmotions(5);
        console.log("   Result:", emotions);
    } catch (e: any) {
        console.log("   ❌ Error:", e.message);
    }

    try {
        // Try calling getLeaderboard (new function)
        console.log("\n✅ Testing getLeaderboard...");
        const leaderboard = await contract.getLeaderboard(5);
        console.log("   Result:", leaderboard);
    } catch (e: any) {
        console.log("   ❌ Error:", e.message);
    }

    console.log("\n" + "=".repeat(60));
    console.log("If all tests failed, the contract needs to be redeployed!");
    console.log("Run: npx hardhat run scripts/deploy.ts --network celo-sepolia");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
