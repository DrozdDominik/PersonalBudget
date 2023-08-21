export type TransactionId = string & { __TransactionId__: void }

export enum TransactionType {
    INCOME = 'income',
    EXPANSE = 'expanse'
}