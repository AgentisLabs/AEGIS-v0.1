🤝🏻 Cooperation-API:🕹Integrate GMGN Solana Trading API
Welcome to integrate GMGN's Solana trading API for fast quantitative trading.
1. Query Router Endpoint (Anti-MEV Supported):
Copy
<https://gmgn.ai/defi/router/v1/sol/tx/get_swap_route?token_in_address=${inputToken}&token_out_address=${outputToken}&in_amount=${amount}&from_address=${fromAddress}&slippage=${slippage}>
Request Method: GET
API Key: Free to use, no need to request an API Key.
Input Parameters:
Parameter
Type
Description
token_in_address
string
The address of the token to spend, e.g., So11111111111111111111111111111111111111112
token_out_address
string
The address of the target token, e.g., 7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs
in_amount
string
Amount in lamports, 100000000=0.1SOL
from_address
string
The wallet address initiating the transaction, e.g., 2kpJ5QRh16aRQ4oLZ5LnucHFDAZtEFz6omqWWMzDSNrx
slippage
float
Slippage percentage, e.g., 10 for 10%
swap_mode
string
ExactIn or ExactOut, default is ExactIn
fee
float
Network priority fees and PRC node tip fees. For example, 0.006, unit SOL. GMGN will automatically allocate node tip tips and network priority fees.
is_anti_mev
bool
Optional, set 'true' when swap with JITO Anti-MEV
partner
string
(optional) partner source name
Return Parameters:
Parameter
Type
Description
code
int
Error code, 0
msg
string
Result description, success
data
Object
{
     quote: {
       inputMint: 'So11111111111111111111111111111111111111112',
       inAmount: '50000000',
       outputMint: '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
       outAmount: '77920478752',
       otherAmountThreshold: '77530876359',
       swapMode: 'ExactIn',
       slippageBps: 50,
       platformFee: null,
       priceImpactPct: '0',
       routePlan: [Array],
       contextSlot: 240893434,
       timeTaken: 0.04250061
     },
     raw_tx: {
       swapTransaction: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAIDxoVIz70VFGJdL5OoCKmFca4NP2MXOcNEiFO6y6JoFUNGWxA6mmc96B1sKHdcYHTM1M1QYNOOSahRPMddzM8XdRsp8RcOMdvjkujt1otIW/R6tIhAHlyC8kUDXj133RK+Ye1I/p3Gy551653GdDPX3KX0D4dWPXyZvsBemb3XlwHyQ+0ezK8pEPmQbXwZ8Tz3O52/YACoT20v0iE4A7D1bTgIWD7ScmJ4Koq6/mSOQVxqfFkoUZ5qTF4TbXDFfH1U+qMakgEp96ZVF6SJaXlGdV6w0mXkHJVedqOxh5rfjqMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADBkZv5SEXMv/srbpyw5vnvIzlu8X3EmssQ5s6QAAAAAR51VvyMcBu7nTFbs5oFQf9sbLeo/SOUQKxzaJWvBOPBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKlcnp1fowmGSs19gRjTJjE83nuG3xjhl5JKAxhv/p89eoKX5UT/REBqE7f6ZMLP+j7G4V34k14Ax0Fw3q7wE/N9jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+Fm0P/on9df2SnTAmx8pWHneSwmrNt/J3VFLMhqns4zl6PSRqslFk9OGKukg94vbePj7SOGor/mX5COZhlMmlOYbCAgABQI6UwcACAAJAyBOAAAAAAAADQYABQAnBwoBAQcCAAUMAgAAAIDw+gIAAAAACgEFARENBgACAAsHCgEBCTMKDAAFAwYCJwsJCQ4JIAoMHAMdAR4aHxsoIiMYDAEEFxkWFQokJiUgCgwSBhMEFBAPESEuwSCbM0HWnIEGAwAAABEBZAABGWQBAhEAZAIDgPD6AgAAAAAgJmwkEgAAADIAAAoDBQAAAQkDegmW2ZAMszm+4Eneq5orFPHiSoriEDigyGyG9FUTd+oGpqilp6GiAp+jq4YFkrWa2UlUnmJKVsvmeovDYVI3GhRB1TB5/repN9MFSEVDREcFQkxGSUuC/JDNwibla4b9UHQsSYKI/HmR9edfsxbKg36RCgUpKAaNi5CGiogCkY4=',
       lastValidBlockHeight: 221852977,
       prioritizationFeeLamports: 9601,
       recentBlockhash: 'HThJomQ74BKBYYfFewg9m5MrRwAsHjrpuTwEcohxpAEW'
     }
   }
Explanation of data.quote Fields:
Parameter
Type
Description
inputMint
string
Input token address, e.g., So11111111111111111111111111111111111111112
inAmount
string
Input token amount in lamports
outputMint
string
Output token address, e.g., 7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs
outputAmount
string
Expected output amount in lamports
otherAmountThreshold
string
Slippage-adjusted value in lamports
swapMode
string
ExactIn or ExactOut
slippageBps
50
Slippage Bps value, with 10000 as the denominator.
platformFee
string
Platform fee, null if none
priceImpact
string
Price impact percentage, 0
routePlan
Array
Routing steps
contextSlot
int
Slot number
timeTaken
float
Time taken for routing in seconds
Explanation of routePlan Type:

Explanation of data.raw_tx Fields:
Parameter
Type
Description
swapTransaction
string
Base64-encoded unsigned transaction
lastValidBlockHeight
int
Block height at the time of transaction creation, e.g., 221852977
recentBlockhash
string
Recent block hash at the time of transaction creation, e.g., HThJomQ74BKBYYfFewg9m5MrRwAsHjrpuTwEcohxpAEW
prioritizationFeeLamports
int
Suggested prioritization fee in lamports, e.g., 9601
2. Submit Transaction Endpoint(General):
Copy
https://gmgn.ai/defi/router/v1/sol/tx/submit_signed_transaction
Request Method: POST
After receiving the routing interface response, decode the base64 string and deserialize using VersionedTransaction, sign with the local wallet, and then encode the signed transaction in base64 and post to the endpoint:
Copy
  const swapTransactionBuf = Buffer.from(route.data.raw_tx.swapTransaction, 'base64')
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
  transaction.sign([wallet.payer])
  const signedTx = transaction.serialize().toString('base64')
Request Parameters:
Parameter
Type
Description
signed_tx
string
Signed transaction, base64-encoded string
Return Fields:
Parameter
Type
Description
code
int
Error code, 0
msg
string
Error message, success
data
Object
{
     hash: '3Qr9Kb8XfQiTa2E4butFRdVgWb9jTorcQaCPx3zx9fETyZhnffVdjagGU7PkwJVX8X9Js4xvUjybCaNjvFGozoLR'
   }
3. Submit Transaction Endpoint(Anti-MEV)
Copy
https://gmgn.ai/defi/router/v1/sol/tx/submit_signed_bundle_transaction
Request Method: POST
After receiving the routing interface response, decode the base64 string and deserialize using VersionedTransaction, sign with the local wallet, and then encode the signed transaction in base64 and post to the endpoint:
Copy
  const swapTransactionBuf = Buffer.from(route.data.raw_tx.swapTransaction, 'base64')
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
  transaction.sign([wallet.payer])
  const signedTx = Buffer.from(transaction.serialize()).toString("base64")
Request Parameters:
signed_tx
string
Signed transaction, base64-encoded string
from_address
string
Trader's wallet
Return Parameters:
code
int
Error code, 0
msg
string
Error code, success
data
Object
{
order_id: '69D41199-5D62-4225-98C0-1FC3BA428958',
    bundle_id: '3Qr9Kb8XfQiTa2E4butFRdVgWb9jTorcQaCPx3zx9fETyZhnffVdjagGU7PkwJVX8X9Js4xvUjybCaNjvFGozoLR',
last_valid_block_number: 123456744，
tx_hash: '2atVpaMiGLwEsJsJZtT9B9DnMALofTWHmWHMAdo3kSks9Ap3NdChz73umNoUsogbyFgR5zUsAN9X8bdfPnpGHHfV'
  },
 

4. Transaction Status Query Endpoint:
Copy
https://gmgn.ai/defi/router/v1/sol/tx/get_transaction_status?hash=${hash}&last_valid_height=${lastValidBlockHeight}
Request Method: GET
Request Parameters:
Parameter
Type
Description
hash
string
Transaction hash returned after submission, e.g., 3Qr9Kb8XfQiTa2E4butFRdVgWb9jTorcQaCPx3zx9fETyZhnffVdjagGU7PkwJVX8X9Js4xvUjybCaNjvFGozoLR
last_valid_height
int
Block height at the time of transaction creation, e.g., 221852977
Return Fields:
Parameter
Type
Description
code
int
0
msg
string
success
data
Object
{ success: true, expired: false }
Explanation of data Fields:
success: Whether the transaction was successfully added to the blockchain, true if successful.
failed: Whether the transaction was added to the blockchain but failed, true if it failed.
expired: Whether the transaction has expired. If expired=true and success=false, the transaction has expired and needs to be resubmitted. Generally, a transaction expires after 60 seconds.
If success=true, the transaction has been successfully added to the blockchain.
Example code:
Copy
import { Wallet } from '@project-serum/anchor'
import { Connection, Keypair, VersionedTransaction,LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58';
import fetch from 'node-fetch'
import sleep from './util/sleep.js'
const inputToken = 'So11111111111111111111111111111111111111112'
const outputToken = '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs'
const amount = '50000000'
const fromAddress = '2kpJ5QRh16aRQ4oLZ5LnucHFDAZtEFz6omqWWMzDSNrx'
const slippage = 0.5
// GMGN API domain
const API_HOST = 'https://gmgn.ai'
async function main() {
  // Wallet initialization, skip this step if using Phantom
  const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')))
  console.log(`wallet address: ${wallet.publicKey.toString()}`)
  // Get quote and unsigned transaction
  const quoteUrl = `${AdPI_HOST}/defi/router/v1/sol/tx/get_swap_route?token_in_address=${inputToken}&token_out_address=${outputToken}&in_amount=${amount}&from_address=${fromAddress}&slippage=${slippage}`
  let route = await fetch(quoteUrl)
  route = await route.json()
  console.log(route)
  // Sign transaction
  const swapTransactionBuf = Buffer.from(route.data.raw_tx.swapTransaction, 'base64')
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
  transaction.sign([wallet.payer])
  const signedTx = Buffer.from(transaction.serialize()).toString('base64')
  console.log(signedTx)
  // Submit transaction
  let res = await fetch(`${API_HOST}/defi/router/v1/sol/tx/submit_signed_transaction`,
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(
        {
          "signed_tx": signedTx
        }
      )
    })
  res = await res.json()
  console.log(res)
  // Check transaction status
  // If the transaction is successful, success returns true
  // If is does not go through，expired=true will be returned after 60 seconds
  while (true) {
    const hash =  res.data.hash
    const lastValidBlockHeight = route.data.raw_tx.lastValidBlockHeight
    const statusUrl = `${API_HOST}/defi/router/v1/sol/tx/get_transaction_status?hash=${hash}&last_valid_height=${lastValidBlockHeight}`
    let status = await fetch(statusUrl)
    status = await status.json()
    console.log(status)
    if (status && (status.data.success === true || status.data.expired === true))
      break
    await sleep(1000)
  }
}
main()