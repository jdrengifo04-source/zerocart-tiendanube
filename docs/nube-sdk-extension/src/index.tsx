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

        console.log(`[ZeroCart] 🎨 Rendering Premium UI v26 for ${productName}`);

        // Initial values from state
        let currentProductName = productName;
        let currentProductImage = productImage;
        let downloadUrl = `https://zerocart.jrengifo.com/download/${cartId}`;

        // Attempt to fetch details from our backend
        const fetchOrderDetails = async () => {
            try {
                const sdkState = nube.getState();
                const storeId = sdkState.store.id;

                console.log(`[ZeroCart] 📥 Fetching dynamic links for Store: ${storeId}, Cart: ${cartId}`);

                const response = await fetch(`https://zerocart.jrengifo.com/api/order/details?cart_id=${cartId}&store_id=${storeId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.products && data.products.length > 0) {
                        const firstProduct = data.products[0];
                        if (firstProduct.googleDriveLink) {
                            downloadUrl = firstProduct.googleDriveLink;
                            console.log(`[ZeroCart] ✅ Dynamic link found: ${downloadUrl}`);
                        }
                        currentProductName = firstProduct.name;
                        currentProductImage = firstProduct.image;
                        // Rerender with real data
                        renderUI(currentProductName, currentProductImage, downloadUrl);
                    }
                }
            } catch (e) {
                console.error("Zerocart: Error fetching dynamic links", e);
            }
        };

        const renderUI = (pName: string, pImg: string, pUrl: string) => {
            nube.render("after_header" as any, [
                {
                    type: "box",
                    background: "surface",
                    borderRadius: "24px",
                    width: "100%",
                    direction: "col",
                    style: {
                        marginTop: "32px",
                        marginBottom: "32px",
                        marginLeft: "auto",
                        marginRight: "auto",
                        maxWidth: "448px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #f3f4f6",
                        overflow: "hidden" as any,
                        display: "flex",
                        flexDirection: "column"
                    },
                    children: [
                        // Header section
                        {
                            type: "col",
                            alignItems: "center",
                            style: {
                                paddingTop: "40px",
                                paddingBottom: "24px",
                                paddingLeft: "32px",
                                paddingRight: "32px",
                                display: "flex",
                                flexDirection: "column"
                            },
                            children: [
                                {
                                    type: "box",
                                    background: "#f0fdf4", // bg-green-50
                                    borderRadius: "100px",
                                    direction: "col",
                                    style: {
                                        marginBottom: "16px",
                                        paddingTop: "12px",
                                        paddingBottom: "12px",
                                        paddingLeft: "12px",
                                        paddingRight: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    },
                                    children: [
                                        { type: "icon", name: "check-circle", color: "#10b981", size: "64px" }
                                    ]
                                },
                                {
                                    type: "txt",
                                    children: "¡Tu compra ha sido aprobada!",
                                    modifiers: ["bold"],
                                    style: { fontSize: "30px", color: "#1e293b", textAlign: "center", lineHeight: "1.2" }
                                },
                                {
                                    type: "txt",
                                    children: "Gracias por confiar en ZeroCart.",
                                    style: { fontSize: "16px", color: "#64748b", marginTop: "8px", textAlign: "center" }
                                }
                            ]
                        },
                        // Divider
                        {
                            type: "box",
                            height: "1px",
                            background: "#f3f4f6",
                            style: { marginLeft: "32px", marginRight: "32px" }
                        },
                        // Product View
                        {
                            type: "col",
                            alignItems: "center",
                            style: {
                                paddingTop: "32px",
                                paddingBottom: "32px",
                                paddingLeft: "32px",
                                paddingRight: "32px",
                                display: "flex",
                                flexDirection: "column"
                            },
                            children: [
                                pImg ? {
                                    type: "box",
                                    width: "192px",
                                    height: "192px",
                                    borderRadius: "16px",
                                    direction: "col",
                                    style: {
                                        marginBottom: "24px",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                        overflow: "hidden" as any,
                                        display: "flex",
                                        flexDirection: "column"
                                    },
                                    children: [
                                        {
                                            type: "img",
                                            src: pImg,
                                            alt: pName || "Producto",
                                            width: "100%",
                                            height: "100%",
                                            style: { objectFit: "cover" as any }
                                        }
                                    ]
                                } : {
                                    type: "box",
                                    width: "192px",
                                    height: "192px",
                                    background: "#3b82f6",
                                    borderRadius: "16px",
                                    direction: "col",
                                    style: {
                                        marginBottom: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    },
                                    children: [
                                        { type: "txt", children: "Z", style: { fontSize: "80px", color: "white", fontWeight: "900" } }
                                    ]
                                },
                                {
                                    type: "txt",
                                    children: pName,
                                    modifiers: ["bold"],
                                    style: { fontSize: "24px", color: "#1e293b", marginBottom: "4px" }
                                },
                                {
                                    type: "box",
                                    background: "#dcfce7", // bg-green-100
                                    borderRadius: "100px",
                                    direction: "col",
                                    style: {
                                        paddingTop: "4px",
                                        paddingBottom: "4px",
                                        paddingLeft: "12px",
                                        paddingRight: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center"
                                    },
                                    children: [
                                        {
                                            type: "txt",
                                            children: " Listo para descargar",
                                            style: { fontSize: "14px", color: "#15803d", fontWeight: "600" }
                                        }
                                    ]
                                }
                            ]
                        },
                        // Action Section
                        {
                            type: "box",
                            direction: "col",
                            style: {
                                paddingLeft: "32px",
                                paddingRight: "32px",
                                paddingBottom: "32px", // Added more bottom padding
                                display: "flex",
                                flexDirection: "column"
                            },
                            children: [
                                {
                                    type: "link",
                                    href: pUrl,
                                    variant: "primary",
                                    style: {
                                        width: "100%",
                                        paddingTop: "16px",
                                        paddingBottom: "16px",
                                        paddingLeft: "16px",
                                        paddingRight: "16px",
                                        borderRadius: "16px",
                                        background: "#3b82f6",
                                        color: "white",
                                        fontWeight: "700",
                                        fontSize: "18px",
                                        textAlign: "center",
                                        boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                                        display: "block"
                                    },
                                    children: [
                                        "Descargar Ahora"
                                    ]
                                }
                            ]
                        },
                        // Tip Section
                        {
                            type: "box",
                            background: "#f9fafb", // bg-gray-50/50
                            direction: "col",
                            style: {
                                borderTop: "1px solid #f3f4f6",
                                paddingTop: "24px",
                                paddingBottom: "24px",
                                paddingLeft: "24px",
                                paddingRight: "24px",
                                display: "flex",
                                flexDirection: "column"
                            },
                            children: [
                                {
                                    type: "box",
                                    background: "rgba(254, 249, 195, 0.4)", // bg-tip-yellow/40
                                    direction: "col",
                                    style: {
                                        border: "1px solid #fef3c7",
                                        borderRadius: "12px",
                                        paddingTop: "16px",
                                        paddingBottom: "16px",
                                        paddingLeft: "16px",
                                        paddingRight: "16px",
                                        display: "flex",
                                        flexDirection: "column"
                                    },
                                    children: [
                                        {
                                            type: "row",
                                            style: { display: "flex", alignItems: "center" },
                                            children: [
                                                { type: "txt", children: "💡", style: { fontSize: "18px", marginRight: "12px" } },
                                                {
                                                    type: "txt",
                                                    children: "Consejo: Guarda esta página en tus marcadores para acceder a tu descarga más tarde.",
                                                    style: { fontSize: "14px", color: "#854d0e", lineHeight: "1.5" }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ] as NubeComponent[]
                }
            ]);
        };

        // Initial render with generic data
        renderUI(productName, productImage, downloadUrl);

        // Trigger async fetch to get real data if available
        fetchOrderDetails();
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
