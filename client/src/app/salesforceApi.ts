import { api } from "./api";
import type {AccountType} from "../types/types.ts";

export type SalesforceUpgradePayload = {
    companyName: string;
    lastName: string;
    email: string;
    plan: AccountType
};

type SalesforceUpgradeResponse = {
    accountId: string;
    contactId: string;
};

export const salesforceApi = api.injectEndpoints({
    endpoints: (build) => ({
        upgradeSalesforce: build.mutation<
            SalesforceUpgradeResponse,
            SalesforceUpgradePayload
        >({
            query: (body) => ({
                url: '/salesforce/upgrade',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {useUpgradeSalesforceMutation} = salesforceApi;