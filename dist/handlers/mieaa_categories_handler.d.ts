export declare class MiEAACategoriesHandler {
    run(args: {
        species: string;
        entity: "mirna" | "precursor";
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        structuredContent: {
            categories: string[];
        };
    }>;
}
//# sourceMappingURL=mieaa_categories_handler.d.ts.map