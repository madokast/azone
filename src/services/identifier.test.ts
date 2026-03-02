import { describe, it, expect } from "vitest"
import { extractDate, extractYYYYMMDD, generateId } from "./identifier"

describe("generateId", () => {
    it("generates a unique id", () => {
        const id = generateId()
        console.log(`Generated ID: ${id}`)
        expect(id).toBeTypeOf("string")
    })
})

describe("extractDate", () => {
    it("extracts date from id", () => {
        const id = generateId()
        const date = extractDate(id)
        console.log(`Extracted Date: ${date}`)
        expect(date).toBeInstanceOf(Date)

        const now = new Date()
        if (Math.abs(date.getTime() - now.getTime()) > 1000) {
            console.log(`Current Time: ${now}`)
            throw new Error("Date extracted from ID is not close to current time")
        }
    })
})

describe("extractYYYYMMDD", () => {
    it("extracts year, month, day from id", () => {
        const id = generateId()
        const { year, month, day } = extractYYYYMMDD(id)
        console.log(`Extracted YYYYMMDD: ${year}${month}${day}`)
        const date = extractDate(id)
        if (date.getFullYear().toString() !== year) {
            console.log(`Year extracted from ID: ${year}`)
            throw new Error("Year extracted from ID does not match")
        }
        if (date.getMonth() + 1 !== parseInt(month)) {
            console.log(`Month extracted from ID: ${month}`)
            throw new Error("Month extracted from ID does not match")
        }
        if (date.getDate() !== parseInt(day)) {
            console.log(`Day extracted from ID: ${day}`)
            throw new Error("Day extracted from ID does not match")
        }
    })
})
