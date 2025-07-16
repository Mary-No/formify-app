import { api } from './api';

type GenerateApiTokenResponse = {
    apiToken: string;
};

export const odooApi = api.injectEndpoints({
    endpoints: (build) => ({
        generateApiToken: build.mutation<GenerateApiTokenResponse, void>({
            query: () => ({
                url: '/odoo/generate-api-token',
                method: 'POST',
            }),
        }),
    }),
});

export const { useGenerateApiTokenMutation } = odooApi;
