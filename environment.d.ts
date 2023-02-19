declare global {
    namespace NodeJS {
        interface ProcessEnv {
            supabaseURL: string
            supabaseKEY: string
        }
    }
}

export {}