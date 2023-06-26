import {expect, it} from "vitest";
import {hashPassword} from "./index";
import {faker} from "@faker-js/faker";

it('should creates a hashed password', async () => {
    const password = faker.internet.password()
    const passwordHash = await hashPassword(password)
    const [hash, salt] = passwordHash.split('.')

    expect(passwordHash).not.toEqual(password)
    expect(hash).toBeDefined()
    expect(hash).toHaveLength(64)
    expect(salt).toBeDefined()
    expect(salt).toHaveLength(16)
})