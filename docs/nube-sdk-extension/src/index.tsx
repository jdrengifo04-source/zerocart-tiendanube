import type { NubeSDK, NubeComponent } from "@tiendanube/nube-sdk-types";

/**
 * [ZeroCart] NubeSDK Checkout Extension - Version 24 (Diagnostic)
 * 
 * Goal: Identify which slots are active and force premium styling.
 */

export function App(nube: NubeSDK) {
    console.log("[ZeroCart] 💎 Premium Version 25 Initialized.");

    const renderPremiumUI = (state: any) => {
        const { cart, order, location } = state;
        const cartId = cart?.id || order?.cart_id || location?.page?.data?.cartId || order?.id;

        // Extract product info
        const items = cart?.items || order?.items || [];
        const mainItem = items[0];
        const productName = mainItem?.name || "Tu Producto Digital";
        const productImage = mainItem?.thumbnail || "";

        console.log(`[ZeroCart] 🎨 Rendering Premium UI for ${productName}`);

        nube.render("after_header" as any, [
            {
                type: "box",
                padding: "32px",
                background: "surface",
                borderRadius: "16px",
                style: {
                    marginTop: "24px",
                    marginBottom: "24px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    border: "1px solid #E5E7EB",
                },
                children: [
                    // Header Section
                    {
                        type: "row",
                        alignItems: "center",
                        gap: "12px",
                        style: { marginBottom: "24px" },
                        children: [
                            { type: "icon", name: "check-circle", color: "#10B981", size: "32px" },
                            {
                                type: "col",
                                children: [
                                    {
                                        type: "txt",
                                        children: "¡Tu compra ha sido aprobada!",
                                        modifiers: ["bold"],
                                        style: { fontSize: "24px", color: "#111827" }
                                    },
                                    {
                                        type: "txt",
                                        children: "Gracias por confiar en ZeroCart.",
                                        style: { fontSize: "16px", color: "#6B7280" }
                                    }
                                ]
                            }
                        ]
                    },
                    // Product Display Section
                    {
                        type: "box",
                        padding: "20px",
                        background: "#F9FAFB",
                        borderRadius: "12px",
                        style: {
                            marginBottom: "24px",
                            border: "1px dashed #D1D5DB"
                        },
                        children: [
                            {
                                type: "row",
                                alignItems: "center",
                                gap: "16px",
                                children: [
                                    productImage ? {
                                        type: "img",
                                        src: productImage,
                                        alt: productName,
                                        width: "80px",
                                        height: "80px",
                                        style: { borderRadius: "8px", objectFit: "cover" as any }
                                    } : {
                                        type: "box",
                                        width: "80px",
                                        height: "80px",
                                        background: "#E5E7EB",
                                        borderRadius: "8px",
                                        children: []
                                    },
                                    {
                                        type: "col",
                                        children: [
                                            {
                                                type: "txt",
                                                children: productName,
                                                modifiers: ["bold"],
                                                style: { fontSize: "18px", color: "#1F2937" }
                                            },
                                            {
                                                type: "txt",
                                                children: "Listo para descargar",
                                                style: { fontSize: "14px", color: "#10B981" }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    // Action Section
                    {
                        type: "row",
                        alignItems: "center",
                        gap: "16px",
                        children: [
                            {
                                type: "link",
                                href: `https://zerocart.jrengifo.com/download/${cartId}`,
                                variant: "primary",
                                style: {
                                    paddingLeft: "32px",
                                    paddingRight: "32px",
                                    paddingTop: "16px",
                                    paddingBottom: "16px",
                                    borderRadius: "10px",
                                    fontWeight: "700",
                                    fontSize: "18px",
                                    background: "#3B82F6",
                                    color: "white",
                                    textAlign: "center"
                                },
                                children: [
                                    "Descargar Ahora"
                                ]
                            }
                        ]
                    },
                    // Reminder Section
                    {
                        type: "box",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "#FEF3C7",
                        style: { marginTop: "24px" },
                        children: [
                            {
                                type: "txt",
                                children: "💡 Consejo: Guarda esta página en tus marcadores para acceder a tu descarga más tarde.",
                                style: { fontSize: "13px", color: "#92400E", textAlign: "center" }
                            }
                        ]
                    }
                ]
            }
        ]);
    };

    const handleStateUpdate = (state: any, source: string) => {
        if (!state) return;
        const { location } = state;
        const pageType = location?.page?.type;
        const step = location?.page?.data?.step;

        if (pageType === "checkout" && step === "success") {
            renderPremiumUI(state);
        }
    };

    const events = ["location:updated", "cart:updated", "ui:updated", "order:updated"];
    events.forEach(evt => {
        try {
            nube.on(evt as any, (state) => handleStateUpdate(state, evt));
        } catch (e) { }
    });

    const initialState = nube.getState?.();
    if (initialState) handleStateUpdate(initialState, "initial");
}
