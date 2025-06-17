# e2e AI Prompts

## Initialize test & log response data
Context: e2e test + e2e example test + route + controller 

router.something____;

Create a test for the endpoint above. Make the test only test a successful response and then console log the response.body. Use JSON.stringify to make sure the whole body is logged. Include necessary imports.

## Instruct AI to make test that matches response data (Repeat for each item)
@workspace

check the exact values of all properties in the body. Do each expect statement individually. Do not use toMatchObject on the entire data object.

look at the "channel.e2e.test.ts" file for reference and use the same patterns. Whenever an array is a value, it must be sorted before it is checked by the test. Test only the first item.

Do not remove or overwrite previous tests. Only replace the highlighted test.


{...JSON DATA...}

