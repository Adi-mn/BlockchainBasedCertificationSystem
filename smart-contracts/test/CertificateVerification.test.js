const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CertificateVerification", function () {
  let CertificateVerification;
  let certificateVerification;
  let owner;
  let issuer;
  let verifier;
  let student;
  let unauthorized;

  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const ISSUER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ISSUER_ROLE"));
  const VERIFIER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VERIFIER_ROLE"));

  beforeEach(async function () {
    [owner, issuer, verifier, student, unauthorized] = await ethers.getSigners();

    CertificateVerification = await ethers.getContractFactory("CertificateVerification");
    certificateVerification = await CertificateVerification.deploy();
    await certificateVerification.deployed();

    // Grant roles
    await certificateVerification.grantRole(ISSUER_ROLE, issuer.address);
    await certificateVerification.grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await certificateVerification.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should have zero certificates initially", async function () {
      expect(await certificateVerification.getCertificateCount()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to add issuer", async function () {
      await certificateVerification.addIssuer(student.address);
      expect(await certificateVerification.hasRole(ISSUER_ROLE, student.address)).to.be.true;
    });

    it("Should allow admin to remove issuer", async function () {
      await certificateVerification.addIssuer(student.address);
      await certificateVerification.removeIssuer(student.address);
      expect(await certificateVerification.hasRole(ISSUER_ROLE, student.address)).to.be.false;
    });

    it("Should not allow non-admin to add issuer", async function () {
      await expect(
        certificateVerification.connect(unauthorized).addIssuer(student.address)
      ).to.be.revertedWith("AccessControl:");
    });
  });

  describe("Certificate Issuance", function () {
    const studentEmail = "student@example.com";
    const certificateType = "Bachelor's Degree";
    const ipfsHash = "QmTestHash123456789";
    let issueDate;
    let expiryDate;

    beforeEach(async function () {
      issueDate = Math.floor(Date.now() / 1000);
      expiryDate = issueDate + (365 * 24 * 60 * 60); // 1 year from now
    });

    it("Should allow issuer to issue certificate", async function () {
      const tx = await certificateVerification.connect(issuer).issueCertificate(
        studentEmail,
        certificateType,
        ipfsHash,
        issueDate,
        expiryDate
      );

      await expect(tx)
        .to.emit(certificateVerification, "CertificateIssued")
        .withArgs(1, issuer.address, studentEmail, certificateType, ipfsHash);

      expect(await certificateVerification.getCertificateCount()).to.equal(1);
    });

    it("Should not allow non-issuer to issue certificate", async function () {
      await expect(
        certificateVerification.connect(unauthorized).issueCertificate(
          studentEmail,
          certificateType,
          ipfsHash,
          issueDate,
          expiryDate
        )
      ).to.be.revertedWith("AccessControl:");
    });

    it("Should reject empty student email", async function () {
      await expect(
        certificateVerification.connect(issuer).issueCertificate(
          "",
          certificateType,
          ipfsHash,
          issueDate,
          expiryDate
        )
      ).to.be.revertedWith("Student email cannot be empty");
    });

    it("Should reject future issue date", async function () {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      await expect(
        certificateVerification.connect(issuer).issueCertificate(
          studentEmail,
          certificateType,
          ipfsHash,
          futureDate,
          expiryDate
        )
      ).to.be.revertedWith("Issue date cannot be in the future");
    });
  });

  describe("Certificate Verification", function () {
    let certificateId;
    const studentEmail = "student@example.com";
    const certificateType = "Bachelor's Degree";
    const ipfsHash = "QmTestHash123456789";

    beforeEach(async function () {
      const issueDate = Math.floor(Date.now() / 1000);
      const expiryDate = issueDate + (365 * 24 * 60 * 60);

      await certificateVerification.connect(issuer).issueCertificate(
        studentEmail,
        certificateType,
        ipfsHash,
        issueDate,
        expiryDate
      );
      certificateId = 1;
    });

    it("Should verify valid certificate", async function () {
      const result = await certificateVerification.connect(verifier).verifyCertificate(certificateId);
      expect(result).to.be.true;
    });

    it("Should increment verification count", async function () {
      await certificateVerification.connect(verifier).verifyCertificate(certificateId);
      const cert = await certificateVerification.getCertificateById(certificateId);
      expect(cert.verificationCount).to.equal(1);
    });

    it("Should emit verification event", async function () {
      await expect(certificateVerification.connect(verifier).verifyCertificate(certificateId))
        .to.emit(certificateVerification, "CertificateVerified")
        .withArgs(certificateId, verifier.address, true);
    });

    it("Should reject verification of non-existent certificate", async function () {
      await expect(
        certificateVerification.connect(verifier).verifyCertificate(999)
      ).to.be.revertedWith("Certificate does not exist");
    });
  });

  describe("Certificate Revocation", function () {
    let certificateId;
    const studentEmail = "student@example.com";
    const certificateType = "Bachelor's Degree";
    const ipfsHash = "QmTestHash123456789";
    const revocationReason = "Academic misconduct";

    beforeEach(async function () {
      const issueDate = Math.floor(Date.now() / 1000);
      const expiryDate = issueDate + (365 * 24 * 60 * 60);

      await certificateVerification.connect(issuer).issueCertificate(
        studentEmail,
        certificateType,
        ipfsHash,
        issueDate,
        expiryDate
      );
      certificateId = 1;
    });

    it("Should allow issuer to revoke certificate", async function () {
      await expect(
        certificateVerification.connect(issuer).revokeCertificate(certificateId, revocationReason)
      ).to.emit(certificateVerification, "CertificateRevoked")
        .withArgs(certificateId, issuer.address, revocationReason);

      const cert = await certificateVerification.getCertificateById(certificateId);
      expect(cert.isRevoked).to.be.true;
      expect(cert.isValid).to.be.false;
    });

    it("Should not allow non-issuer to revoke certificate", async function () {
      await expect(
        certificateVerification.connect(unauthorized).revokeCertificate(certificateId, revocationReason)
      ).to.be.revertedWith("Not authorized to modify this certificate");
    });

    it("Should not verify revoked certificate", async function () {
      await certificateVerification.connect(issuer).revokeCertificate(certificateId, revocationReason);
      const result = await certificateVerification.connect(verifier).verifyCertificate(certificateId);
      expect(result).to.be.false;
    });
  });

  describe("Batch Operations", function () {
    let certificateIds;

    beforeEach(async function () {
      const issueDate = Math.floor(Date.now() / 1000);
      const expiryDate = issueDate + (365 * 24 * 60 * 60);

      // Issue 3 certificates
      for (let i = 0; i < 3; i++) {
        await certificateVerification.connect(issuer).issueCertificate(
          `student${i}@example.com`,
          "Bachelor's Degree",
          `QmTestHash${i}`,
          issueDate,
          expiryDate
        );
      }
      certificateIds = [1, 2, 3];
    });

    it("Should batch verify certificates", async function () {
      const results = await certificateVerification.connect(verifier).batchVerifyCertificates(certificateIds);
      expect(results).to.deep.equal([true, true, true]);
    });

    it("Should handle mixed valid/invalid certificates", async function () {
      // Revoke one certificate
      await certificateVerification.connect(issuer).revokeCertificate(2, "Test revocation");
      
      const results = await certificateVerification.connect(verifier).batchVerifyCertificates(certificateIds);
      expect(results).to.deep.equal([true, false, true]);
    });
  });

  describe("Contract Stats", function () {
    beforeEach(async function () {
      const issueDate = Math.floor(Date.now() / 1000);
      const expiryDate = issueDate + (365 * 24 * 60 * 60);

      // Issue 2 certificates
      await certificateVerification.connect(issuer).issueCertificate(
        "student1@example.com",
        "Bachelor's Degree",
        "QmTestHash1",
        issueDate,
        expiryDate
      );

      await certificateVerification.connect(issuer).issueCertificate(
        "student2@example.com",
        "Master's Degree",
        "QmTestHash2",
        issueDate,
        expiryDate
      );

      // Revoke one certificate
      await certificateVerification.connect(issuer).revokeCertificate(1, "Test revocation");

      // Verify certificates
      await certificateVerification.connect(verifier).verifyCertificate(1);
      await certificateVerification.connect(verifier).verifyCertificate(2);
    });

    it("Should return correct contract stats", async function () {
      const stats = await certificateVerification.getContractStats();
      expect(stats.totalCertificates).to.equal(2);
      expect(stats.validCertificates).to.equal(1);
      expect(stats.revokedCertificates).to.equal(1);
      expect(stats.totalVerifications).to.equal(2);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow admin to pause contract", async function () {
      await certificateVerification.pause();
      expect(await certificateVerification.paused()).to.be.true;
    });

    it("Should prevent operations when paused", async function () {
      await certificateVerification.pause();
      
      await expect(
        certificateVerification.connect(issuer).issueCertificate(
          "student@example.com",
          "Bachelor's Degree",
          "QmTestHash",
          Math.floor(Date.now() / 1000),
          0
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow admin to unpause contract", async function () {
      await certificateVerification.pause();
      await certificateVerification.unpause();
      expect(await certificateVerification.paused()).to.be.false;
    });
  });
});