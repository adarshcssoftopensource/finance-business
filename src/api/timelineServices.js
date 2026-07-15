import apiGatewayClient from "./apiGatewayClient";

//Timeline Services

export const getTimeLine = (entityId) => {
  return apiGatewayClient({
    url: `/event-service/external/${entityId}`,
    method: 'GET',
  });
};