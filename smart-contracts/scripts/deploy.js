const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.warn("⚠️  Warning: Low balance. Make sure you have enough funds for deployment.");
  }

  // Deploy CertificateVerification contract
  console.log("\n📄 Deploying CertificateVerification contract...");
  const CertificateVerification = await ethers.getContractFactory("CertificateVerification");
  
  // Estimate gas
  const deploymentData = CertificateVerification.getDeployTransaction();
  const estimatedGas = await deployer.estimateGas(deploymentData);
  console.log("⛽ Estimated gas for deployment:", estimatedGas.toString());

  // Deploy with gas limit
  const certificateVerification = await CertificateVerification.deploy({
    gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer
  });

  console.log("⏳ Waiting for deployment transaction...");
  await certificateVerification.deployed();

  console.log("✅ CertificateVerification deployed to:", certificateVerification.address);
  console.log("📋 Transaction hash:", certificateVerification.deployTransaction.hash);

  // Wait for a few confirmations
  console.log("⏳ Waiting for confirmations...");
  await certificateVerification.deployTransaction.wait(2);

  // Get deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contractAddress: certificateVerification.address,
    deployerAddress: deployer.address,
    transactionHash: certificateVerification.deployTransaction.hash,
    blockNumber: certificateVerification.deployTransaction.blockNumber,
    gasUsed: certificateVerification.deployTransaction.gasLimit?.toString(),
    deployedAt: new Date().toISOString()
  };

  console.log("\n📊 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Contract Address:", deploymentInfo.contractAddress);
  console.log("Deployer:", deploymentInfo.deployerAddress);
  console.log("Transaction Hash:", deploymentInfo.transactionHash);

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Save ABI and contract info for frontend
  const artifactsDir = path.join(__dirname, "../artifacts/contracts/CertificateVerification.sol");
  const artifactFile = path.join(artifactsDir, "CertificateVerification.json");
  
  if (fs.existsSync(artifactFile)) {
    const artifact = JSON.parse(fs.readFileSync(artifactFile, "utf8"));
    
    const contractInfo = {
      address: certificateVerification.address,
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      network: network.name,
      chainId: network.chainId,
      deployedAt: deploymentInfo.deployedAt
    };

    // Save to frontend contracts directory
    const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
    if (!fs.existsSync(frontendContractsDir)) {
      fs.mkdirSync(frontendContractsDir, { recursive: true });
    }

    const frontendContractFile = path.join(frontendContractsDir, "CertificateVerification.json");
    fs.writeFileSync(frontendContractFile, JSON.stringify(contractInfo, null, 2));
    console.log("📁 Contract info saved for frontend:", frontendContractFile);
  }

  // Test basic functionality
  console.log("\n🧪 Testing basic functionality...");
  
  try {
    // Test getting certificate count (should be 0)
    const count = await certificateVerification.getCertificateCount();
    console.log("✅ Initial certificate count:", count.toString());

    // Test contract stats
    const stats = await certificateVerification.getContractStats();
    console.log("✅ Contract stats:", {
      totalCertificates: stats.totalCertificates.toString(),
      validCertificates: stats.validCertificates.toString(),
      revokedCertificates: stats.revokedCertificates.toString(),
      totalVerifications: stats.totalVerifications.toString()
    });

    // Test role checking
    const hasAdminRole = await certificateVerification.hasRole(
      await certificateVerification.ADMIN_ROLE(),
      deployer.address
    );
    console.log("✅ Deployer has admin role:", hasAdminRole);

    const hasIssuerRole = await certificateVerification.hasRole(
      await certificateVerification.ISSUER_ROLE(),
      deployer.address
    );
    console.log("✅ Deployer has issuer role:", hasIssuerRole);

  } catch (error) {
    console.error("❌ Error testing functionality:", error.message);
  }

  // Verification instructions
  console.log("\n📋 Next Steps:");
  console.log("1. Update your .env files with the contract address:");
  console.log(`   REACT_APP_CONTRACT_ADDRESS=${certificateVerification.address}`);
  console.log(`   CONTRACT_ADDRESS=${certificateVerification.address}`);
  
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n2. Verify the contract on block explorer:");
    console.log(`   npx hardhat verify --network ${network.name} ${certificateVerification.address}`);
  }

  console.log("\n3. Grant roles to institutions and verifiers using the admin functions");
  console.log("4. Test the contract integration with your frontend and backend");

  console.log("\n🎉 Deployment completed successfully!");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });