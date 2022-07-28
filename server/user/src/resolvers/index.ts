export const resolvers = {
	Mutation: {
		Login: async (_: any, args: any) => {
			console.log(args)
		},
    },
    Query: {
        Me: (_: any, args: any)=>{
            console.log(args)
        }
    }
}
