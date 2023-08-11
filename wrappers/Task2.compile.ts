import { CompilerConfig } from '@ton-community/blueprint'

export const compile: CompilerConfig = {
    lang: 'func',
    targets: ['contracts/imports/stdlib.fc', 'contracts/2.fc'],
}
