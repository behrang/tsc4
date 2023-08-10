import { Blockchain, SandboxContract } from '@ton-community/sandbox'
import { Cell, TupleBuilder, TupleItem, TupleItemInt, toNano } from 'ton-core'
import { Task2 } from '../wrappers/Task2'
import '@ton-community/test-utils'
import { compile } from '@ton-community/blueprint'

describe('Task2', () => {
    let code: Cell

    beforeAll(async () => {
        code = await compile('Task2')
    })

    let blockchain: Blockchain
    let task2: SandboxContract<Task2>

    beforeEach(async () => {
        blockchain = await Blockchain.create()

        task2 = blockchain.openContract(Task2.createFromConfig({}, code))

        const deployer = await blockchain.treasury('deployer')

        const deployResult = await task2.sendDeploy(deployer.getSender(), toNano('0.05'))

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task2.address,
            deploy: true,
            success: true,
        })
    })

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task2 are ready to use
    })

    it('should multiply simple matrices', async () => {
        const matrixA = [[1, 2, 3]]
        const matrixB = [[4], [5], [6]]
        const result = fromTuple(await task2.getMatrixMultiplier(toTuple(matrixA), toTuple(matrixB)))
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveLength(1)
        expect(result[0][0]).toBe(32)
    })

    it('should multiply larger matrices', async () => {
        const matrixA = [[1, 2, 3], [4, 5, 6]]
        const matrixB = [[1, 0, 0, 1], [0, 1, 1, 0], [1, 1, 0, 0]]
        const result = fromTuple(await task2.getMatrixMultiplier(toTuple(matrixA), toTuple(matrixB)))
        expect(result).toHaveLength(2)
        expect(result[0]).toHaveLength(4)
        expect(result[1]).toHaveLength(4)
        expect(result[0][0]).toBe(4)
        expect(result[0][1]).toBe(5)
        expect(result[0][2]).toBe(2)
        expect(result[0][3]).toBe(1)
        expect(result[1][0]).toBe(10)
        expect(result[1][1]).toBe(11)
        expect(result[1][2]).toBe(5)
        expect(result[1][3]).toBe(4)
    })
})

function toTuple(matrix: number[][]): TupleItem[] {
    const tb = matrix.reduce((acc: TupleBuilder, row: number[]) => {
        const cols: TupleItemInt[] = row.map((value: number) => ({ type: 'int', value: BigInt(value) }))
        acc.writeTuple(cols)
        return acc
    }, new TupleBuilder())
    return tb.build()
}

function fromTuple(input: TupleItem[]): number[][] {
    const result: number[][] = []
    for (let i = 0; i < input.length; i += 1) {
        const resultRow = []
        const inputRow = input[i]
        if (inputRow.type !== 'tuple') {
            throw 'expected a tuple'
        }
        for (let j = 0; j < inputRow.items.length; j += 1) {
            const inputItem = inputRow.items[j]
            if (inputItem.type !== 'int') {
                throw 'expected an int'
            }
            resultRow.push(Number(inputItem.value))
        }
        result.push(resultRow)
    }
    return result
}
