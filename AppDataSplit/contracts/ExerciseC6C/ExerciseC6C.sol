pragma solidity 0.8.12;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ExerciseC6C {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    mapping(address => uint256) authorizedContracts;

    struct Profile {
        string id;
        bool isRegistered;
        bool isAdmin;
        uint256 sales;
        uint256 bonus;
        address wallet;
    }

    address private contractOwner; // Account used to deploy contract
    mapping(string => Profile) employees; // Mapping for storing employees

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    // No events

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor() {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireCallerAuthorized() {
        require(authorizedContracts[msg.sender] == 1, "Caller is not authorized");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/


    function authorizeContract(address dataContract) requireContractOwner external {
        authorizedContracts[dataContract] = 1;
    }

    function deauthorizeContract(address dataContract) requireContractOwner external {
        authorizedContracts[dataContract] = 0;
    }

    /**
     * @dev Check if an employee is registered
     *
     * @return A bool that indicates if the employee is registered
     */
    function isEmployeeRegistered(string memory id) external view returns (bool) {
        return employees[id].isRegistered;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function registerEmployee(
        string memory id,
        bool isAdmin,
        address wallet
    ) external requireContractOwner {
        require(!employees[id].isRegistered, "Employee is already registered.");

        employees[id] = Profile({
            id: id,
            isRegistered: true,
            isAdmin: isAdmin,
            sales: 0,
            bonus: 0,
            wallet: wallet
        });
    }

    function getEmployeeBonus(string memory id)
        external
        view
        requireContractOwner
        returns (uint256)
    {
        return employees[id].bonus;
    }

    function updateEmployee(
        string memory id,
        uint256 sales,
        uint256 bonus
    ) external {
        require(employees[id].isRegistered, "Employee is not registered.");

        employees[id].sales = employees[id].sales.add(sales);
        employees[id].bonus = employees[id].bonus.add(bonus);
    }
}
