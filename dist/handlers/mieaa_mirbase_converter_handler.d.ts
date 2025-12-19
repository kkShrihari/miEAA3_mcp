export declare class MiEAAMirBaseConverterHandler {
    run(args: {
        mirnas: string[];
        from_version: string;
        to_version: string;
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        structuredContent: {
            conversions: ({
                input: string;
                output: string;
                status: string;
                reason: string;
            } | {
                input: string;
                output: null;
                status: string;
                reason: string;
            })[];
        };
    }>;
}
//# sourceMappingURL=mieaa_mirbase_converter_handler.d.ts.map