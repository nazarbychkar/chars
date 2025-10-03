import { Suspense } from "react";
import Catalog from "@/components/catalog/Catalog";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading catalog...</div>}>
            <Catalog />
        </Suspense>
    );
}