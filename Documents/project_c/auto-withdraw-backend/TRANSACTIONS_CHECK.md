CHECK transaction

    Sample code of the CHECK request with reference, "application/json" format:

    {
        "api_version": 1,
        "merchant_account": "Account_MP_TRX",
        "merchant_password": "password123",
        "transaction_type": "CHECK",
        "reference": "ATFF00000000395AD690"
    }

    Sample code of the CHECK request with transaction id, "application/json" format:

    {
        "api_version": 1,
        "merchant_account": "Account_MP_TRX",
        "merchant_password": "password123",
        "transaction_type": "CHECK",
        "transaction_unique_id": "check_request"
    }

Purpose: Interface should be used to check transaction status.

Request parameters:
PARAMETER NAME 	REQUIRED 	FORMAT and RULE 	DESCRIPTION
api_version 	yes 	int
Possible value: 1 	API version
merchant_account 	yes 	string (6-32) 	Merchant account
merchant_password 	yes 	string (6-32) 	Account password
transaction_type 	yes 	string
Possible value: CHECK 	Type of the transaction: CHECK
transaction_unique_id 	conditional 	string (1-45) 	Unique transaction Id
reference 	conditional 	string (20) 	Reference of the transaction to check

transaction_unique_id or reference can be passed for CHECK request.

    Sample code of the CHECK response in "application/json" format:

    {
        "api_version": 1,
        "merchant_account": "Account_MP_TRX",
        "sessionid": "5668fbfb-2d9c-492c-9f7c-11fb8ae9e3fc",
        "transactions": [
            {
                "reference": "ATFF00000000395AD690",
                "transaction_unique_id": "check_request",
                "transaction_type": "AUTH",
                "status": "SUCCESS",
                "code": 0,
                "message": "SUCCESS",
                "token": "5519225d-3460-433f-ad4e-62649d0bb909",
                "timestamp": 1529796980,
                "authcode": "111313"
            }
        ],
        "status": "success",
        "code": 0,
        "message": "Transaction processed successfully"
    }

Response parameters:
PARAMETER NAME 	FORMAT and RULE 	DESCRIPTION
api_version 	int
Possible value: 1 	API version
merchant_account 	string (6-32) 	Merchant account
sessionid 	string (36) 	Id of the session
transactions 	array 	Contains of transaction data array
reference 	string (20) 	Reference of the transaction in Maxpay system
transaction_unique_id 	string (1-45) 	Unique transaction Id
transaction_type 	string
Possible values: AUTH3D, AUTH, SALE3D, SALE, VOID, REFUND 	Type of the transaction
status 	string
Possible values: success, decline, error 	Status of the transaction
code 	integer (1-4) 	Response code regarding the transaction result
message 	string (6-255) 	Response message regarding the transaction result
token 	string (36) 	Hashed value of card number, expiry date and cardholder name
timestamp 	integer (unix timestamp) 	Timestamp of the transaction
authcode 	string or null (0-24) 	Authorization code
transactions 	end of the array 	** -//- **
status 	string
Possible values: success, decline, error 	Status of the transaction
code 	integer (1-4) 	Response code regarding the transaction result
message 	string (6-255) 	Response message regarding the transaction result

After the CHECK transaction has been processed merchant can send any transactons depending on the stage of an actual transaction flow process
