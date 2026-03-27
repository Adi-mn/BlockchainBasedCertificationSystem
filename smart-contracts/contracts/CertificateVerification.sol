// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertificateVerification
 * @dev Smart contract for managing and verifying educational certificates on blockchain
 * @author Certificate Verification Team
 */
contract CertificateVerification is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Certificate structure
    struct Certificate {
        uint256 id;
        address issuer;
        string studentEmail;
        string certificateType;
        string ipfsHash;
        uint256 issueDate;
        uint256 expiryDate;
        bool isValid;
        bool isRevoked;
        string revocationReason;
        uint256 verificationCount;
    }

    // State variables
    Counters.Counter private _certificateIds;
    mapping(uint256 => Certificate) private _certificates;
    mapping(address => uint256[]) private _issuerCertificates;
    mapping(string => uint256[]) private _studentCertificates; // studentEmail => certificateIds
    mapping(uint256 => address[]) private _certificateVerifiers;

    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed issuer,
        string studentEmail,
        string certificateType,
        string ipfsHash
    );

    event CertificateVerified(
        uint256 indexed certificateId,
        address indexed verifier,
        bool isValid
    );

    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed revoker,
        string reason
    );

    event IssuerAdded(address indexed issuer, address indexed admin);
    event IssuerRemoved(address indexed issuer, address indexed admin);

    // Modifiers
    modifier certificateExists(uint256 certificateId) {
        require(_certificates[certificateId].id != 0, "Certificate does not exist");
        _;
    }

    modifier onlyIssuerOrAdmin(uint256 certificateId) {
        require(
            _certificates[certificateId].issuer == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to modify this certificate"
        );
        _;
    }

    /**
     * @dev Constructor sets up roles and initial admin
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Issue a new certificate
     * @param studentEmail Email of the student
     * @param certificateType Type of certificate
     * @param ipfsHash IPFS hash of the certificate document
     * @param issueDate Timestamp when certificate was issued
     * @param expiryDate Timestamp when certificate expires (0 for no expiry)
     * @return certificateId The ID of the newly issued certificate
     */
    function issueCertificate(
        string memory studentEmail,
        string memory certificateType,
        string memory ipfsHash,
        uint256 issueDate,
        uint256 expiryDate
    ) external onlyRole(ISSUER_ROLE) whenNotPaused nonReentrant returns (uint256) {
        require(bytes(studentEmail).length > 0, "Student email cannot be empty");
        require(bytes(certificateType).length > 0, "Certificate type cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(issueDate <= block.timestamp, "Issue date cannot be in the future");
        require(expiryDate == 0 || expiryDate > issueDate, "Expiry date must be after issue date");

        _certificateIds.increment();
        uint256 certificateId = _certificateIds.current();

        Certificate storage newCertificate = _certificates[certificateId];
        newCertificate.id = certificateId;
        newCertificate.issuer = msg.sender;
        newCertificate.studentEmail = studentEmail;
        newCertificate.certificateType = certificateType;
        newCertificate.ipfsHash = ipfsHash;
        newCertificate.issueDate = issueDate;
        newCertificate.expiryDate = expiryDate;
        newCertificate.isValid = true;
        newCertificate.isRevoked = false;
        newCertificate.verificationCount = 0;

        // Update mappings
        _issuerCertificates[msg.sender].push(certificateId);
        _studentCertificates[studentEmail].push(certificateId);

        emit CertificateIssued(
            certificateId,
            msg.sender,
            studentEmail,
            certificateType,
            ipfsHash
        );

        return certificateId;
    }

    /**
     * @dev Verify a certificate and increment verification count
     * @param certificateId ID of the certificate to verify
     * @return isValid Whether the certificate is valid
     */
    function verifyCertificate(uint256 certificateId) 
        external 
        certificateExists(certificateId) 
        whenNotPaused 
        nonReentrant 
        returns (bool) 
    {
        Certificate storage cert = _certificates[certificateId];
        
        // Increment verification count
        cert.verificationCount++;
        
        // Add verifier to the list
        _certificateVerifiers[certificateId].push(msg.sender);

        // Check if certificate is valid
        bool isCurrentlyValid = cert.isValid && 
                               !cert.isRevoked && 
                               (cert.expiryDate == 0 || cert.expiryDate > block.timestamp);

        emit CertificateVerified(certificateId, msg.sender, isCurrentlyValid);

        return isCurrentlyValid;
    }

    /**
     * @dev Revoke a certificate
     * @param certificateId ID of the certificate to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(uint256 certificateId, string memory reason) 
        external 
        certificateExists(certificateId) 
        onlyIssuerOrAdmin(certificateId) 
        whenNotPaused 
        nonReentrant 
    {
        require(bytes(reason).length > 0, "Revocation reason cannot be empty");
        
        Certificate storage cert = _certificates[certificateId];
        require(!cert.isRevoked, "Certificate is already revoked");

        cert.isRevoked = true;
        cert.isValid = false;
        cert.revocationReason = reason;

        emit CertificateRevoked(certificateId, msg.sender, reason);
    }

    /**
     * @dev Get certificate details by ID
     * @param certificateId ID of the certificate
     * @return Certificate struct
     */
    function getCertificateById(uint256 certificateId) 
        external 
        view 
        certificateExists(certificateId) 
        returns (Certificate memory) 
    {
        return _certificates[certificateId];
    }

    /**
     * @dev Get certificates issued by a specific issuer
     * @param issuer Address of the issuer
     * @return Array of certificate IDs
     */
    function getCertificatesByIssuer(address issuer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _issuerCertificates[issuer];
    }

    /**
     * @dev Get certificates for a specific student
     * @param studentEmail Email of the student
     * @return Array of certificate IDs
     */
    function getCertificatesByStudent(string memory studentEmail) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _studentCertificates[studentEmail];
    }

    /**
     * @dev Get verifiers who have verified a certificate
     * @param certificateId ID of the certificate
     * @return Array of verifier addresses
     */
    function getCertificateVerifiers(uint256 certificateId) 
        external 
        view 
        certificateExists(certificateId) 
        returns (address[] memory) 
    {
        return _certificateVerifiers[certificateId];
    }

    /**
     * @dev Get total number of certificates issued
     * @return Total certificate count
     */
    function getCertificateCount() external view returns (uint256) {
        return _certificateIds.current();
    }

    /**
     * @dev Check if a certificate is expired
     * @param certificateId ID of the certificate
     * @return Whether the certificate is expired
     */
    function isCertificateExpired(uint256 certificateId) 
        external 
        view 
        certificateExists(certificateId) 
        returns (bool) 
    {
        Certificate memory cert = _certificates[certificateId];
        return cert.expiryDate != 0 && cert.expiryDate <= block.timestamp;
    }

    /**
     * @dev Batch verify multiple certificates
     * @param certificateIds Array of certificate IDs to verify
     * @return Array of verification results
     */
    function batchVerifyCertificates(uint256[] memory certificateIds) 
        external 
        whenNotPaused 
        nonReentrant 
        returns (bool[] memory) 
    {
        require(certificateIds.length > 0, "No certificates to verify");
        require(certificateIds.length <= 50, "Too many certificates to verify at once");

        bool[] memory results = new bool[](certificateIds.length);

        for (uint256 i = 0; i < certificateIds.length; i++) {
            uint256 certificateId = certificateIds[i];
            
            if (_certificates[certificateId].id == 0) {
                results[i] = false;
                continue;
            }

            Certificate storage cert = _certificates[certificateId];
            cert.verificationCount++;
            _certificateVerifiers[certificateId].push(msg.sender);

            bool isCurrentlyValid = cert.isValid && 
                                   !cert.isRevoked && 
                                   (cert.expiryDate == 0 || cert.expiryDate > block.timestamp);

            results[i] = isCurrentlyValid;
            emit CertificateVerified(certificateId, msg.sender, isCurrentlyValid);
        }

        return results;
    }

    /**
     * @dev Add a new issuer (Admin only)
     * @param issuer Address to grant issuer role
     */
    function addIssuer(address issuer) external onlyRole(ADMIN_ROLE) {
        require(issuer != address(0), "Invalid issuer address");
        _grantRole(ISSUER_ROLE, issuer);
        emit IssuerAdded(issuer, msg.sender);
    }

    /**
     * @dev Remove an issuer (Admin only)
     * @param issuer Address to revoke issuer role
     */
    function removeIssuer(address issuer) external onlyRole(ADMIN_ROLE) {
        require(issuer != address(0), "Invalid issuer address");
        _revokeRole(ISSUER_ROLE, issuer);
        emit IssuerRemoved(issuer, msg.sender);
    }

    /**
     * @dev Add a new verifier (Admin only)
     * @param verifier Address to grant verifier role
     */
    function addVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        require(verifier != address(0), "Invalid verifier address");
        _grantRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @dev Remove a verifier (Admin only)
     * @param verifier Address to revoke verifier role
     */
    function removeVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        require(verifier != address(0), "Invalid verifier address");
        _revokeRole(VERIFIER_ROLE, verifier);
    }

    /**
     * @dev Pause the contract (Admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract (Admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get contract statistics
     * @return totalCertificates Total number of certificates
     * @return validCertificates Number of valid certificates
     * @return revokedCertificates Number of revoked certificates
     * @return totalVerifications Total number of verifications
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 totalCertificates,
            uint256 validCertificates,
            uint256 revokedCertificates,
            uint256 totalVerifications
        ) 
    {
        totalCertificates = _certificateIds.current();
        
        for (uint256 i = 1; i <= totalCertificates; i++) {
            Certificate memory cert = _certificates[i];
            if (cert.isRevoked) {
                revokedCertificates++;
            } else if (cert.isValid && (cert.expiryDate == 0 || cert.expiryDate > block.timestamp)) {
                validCertificates++;
            }
            totalVerifications += cert.verificationCount;
        }
    }
}