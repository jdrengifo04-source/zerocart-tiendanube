import type { NubeSDK, NubeComponent } from "@tiendanube/nube-sdk-types";

/**
 * [ZeroCart] NubeSDK Checkout Extension - Version 23
 * 
 * Premium UI + Ultimate Placement (after_header)
 * Features: High visibility slot, premium shadows, clear icons, and button styling.
 */

export function App(nube: NubeSDK) {
    console.log("[ZeroCart] 🚀 Extension initialized (v23 - Premium UI).");

    if (!nube) {
        console.error("[ZeroCart] ❌ 'nube' object missing!");
        return;
    }

    let lastStep = "";
    const renderSlot = "after_header"; // Maximum visibility at the top of the page

    const renderContent = async (cartId: string, storeId: string) => {
        console.log(`[ZeroCart] 💎 Rendering v23 UI for cart: ${cartId} (Store: ${storeId})`);

        // Initial loading state with premium card look
        nube.render(renderSlot, [
            {
                type: "box",
                padding: "24px",
                margin: "16px",
                background: "surface",
                borderRadius: "12px",
                style: {
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    border: "1px solid #E5E7EB"
                },
                children: [
                    { type: "txt", children: "🚀 Cargando tus productos digitales..." }
                ]
            }
        ]);

        try {
            const url = `https://zerocart.jrengifo.com/api/order/details?cart_id=${cartId}&store_id=${storeId}`;
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    nube.render(renderSlot, [
                        {
                            type: "box",
                            padding: "24px",
                            margin: "16px",
                            background: "surface",
                            borderRadius: "12px",
                            style: { border: "1px solid #E5E7EB" },
                            children: [
                                { type: "txt", children: "Tu pedido digital se está procesando... revisa tu email en unos minutos." }
                            ]
                        }
                    ]);
                    return;
                }
                throw new Error(`Status ${response.status}`);
            }

            const data = await response.json();

            if (data && data.products && data.products.length > 0) {
                const productButtons: NubeComponent[] = data.products.map((p: any) => ({
                    type: "box",
                    padding: "16px",
                    margin: "12px 0 0 0",
                    background: "surfaceSecondary",
                    borderRadius: "8px",
                    style: { border: "1px solid #E5E7EB" },
                    children: [
                        {
                            type: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            children: [
                                {
                                    type: "box",
                                    children: [
                                        {
                                            type: "txt",
                                            children: p.name,
                                            modifiers: ["bold"],
                                            style: { fontSize: "15px", color: "#1F2937" }
                                        }
                                    ]
                                },
                                {
                                    type: "link",
                                    href: p.googleDriveLink,
                                    target: "_blank",
                                    variant: "primary",
                                    style: {
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        fontWeight: "600",
                                        textDecoration: "none"
                                    },
                                    children: [
                                        {
                                            type: "row",
                                            alignItems: "center",
                                            gap: "8px",
                                            children: [
                                                { type: "icon", name: "download", size: "16px" },
                                                "Descargar"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }));

                nube.render(renderSlot, [
                    {
                        type: "box",
                        padding: "24px",
                        margin: "16px",
                        background: "surface",
                        borderRadius: "12px",
                        style: {
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #E5E7EB",
                        },
                        children: [
                            {
                                type: "row",
                                alignItems: "center",
                                gap: "12px",
                                children: [
                                    { type: "icon", name: "check-circle", color: "#10B981", size: "24px" },
                                    {
                                        type: "txt",
                                        children: data.config?.headline || "Tus productos digitales están listos",
                                        modifiers: ["bold"],
                                        style: { fontSize: "18px", color: "#111827" }
                                    }
                                ]
                            },
                            {
                                type: "box",
                                margin: "12px 0 20px 0",
                                children: [
                                    {
                                        type: "txt",
                                        children: data.config?.message || "Gracias por tu compra. Puedes descargar tus archivos digitales haciendo clic en los botones de abajo.",
                                        style: { color: "#4B5563", lineHeight: "1.5" }
                                    }
                                ]
                            },
                            ...productButtons
                        ]
                    }
                ]);
            } else {
                nube.render(renderSlot, []); // Clear if no products
            }
        } catch (error) {
            console.error("[ZeroCart] ❌ Render Error:", error);
            // Graceful silent failure for the premium slot
        }
    };

    const handleStateUpdate = (state: any, source: string) => {
        if (!state) return;
        const { location, cart, store, order } = state;
        const pageType = location?.page?.type;
        const step = location?.page?.data?.step;

        const currentStepKey = `${pageType}:${step}`;
        if (currentStepKey === lastStep && source !== "initial") return;
        lastStep = currentStepKey;

        console.log(`[ZeroCart] 🔍 State update [${source}] -> Step: ${currentStepKey}`);

        const cartId = cart?.id || order?.cart_id || location?.page?.data?.cartId || order?.id;
        const storeId = store?.id;

        if (pageType === "checkout" && step === "success") {
            if (cartId && storeId) {
                renderContent(cartId, storeId);
            }
        } else {
            nube.render(renderSlot, []);
        }
    };

    const events = ["location:updated", "cart:updated", "ui:updated", "order:updated"];
    events.forEach(evt => {
        try {
            nube.on(evt as any, (state) => handleStateUpdate(state, evt));
        } catch (e) { }
    });

    const watcher = setInterval(() => {
        try {
            const state = nube.getState?.();
            if (state) handleStateUpdate(state, "watcher");
        } catch (e) { }
    }, 2500);

    const initialState = nube.getState?.();
    if (initialState) handleStateUpdate(initialState, "initial");

    return () => clearInterval(watcher);
}
