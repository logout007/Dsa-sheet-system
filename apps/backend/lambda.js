// lambda.js — AWS Lambda entry point
const serverlessExpress = require('@vendia/serverless-express');
const app = require('./src/app');
const connectDB = require('./src/config/db');

let serverlessApp;
let isReady = false;

const setup = async () => {
  await connectDB();
  serverlessApp = serverlessExpress({ app });
  isReady = true;
};

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Strip the stage prefix (/prod) so Express sees the correct path
  if (event.rawPath && event.rawPath.startsWith('/prod')) {
    event.rawPath = event.rawPath.replace('/prod', '') || '/';
    if (event.requestContext && event.requestContext.http) {
      event.requestContext.http.path = event.rawPath;
    }
  }

  if (!isReady) {
    await setup();
  }

  return serverlessApp(event, context);
};
