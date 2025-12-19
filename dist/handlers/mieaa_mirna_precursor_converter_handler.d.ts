export declare class MiEAAMirnaPrecursorConverterHandler {
    run(args: {
        ids: string[];
        direction: "mirna_to_precursor" | "precursor_to_mirna";
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        structuredContent: {
            input_type: string;
            output_type: string;
            direction: "mirna_to_precursor" | "precursor_to_mirna";
            results: {
                input: string;
                output: string[];
            }[];
        };
    }>;
}
//# sourceMappingURL=mieaa_mirna_precursor_converter_handler.d.ts.map