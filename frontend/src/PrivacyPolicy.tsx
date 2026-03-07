import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Política de Privacidad - ZeroCart</h1>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
                <p className="mb-2">
                    ZeroCart recopila información necesaria de su tienda Tiendanube para facilitar la entrega de productos digitales:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Información de pedidos (ID de pedido, productos comprados, estado del pago).</li>
                    <li>Información del cliente (nombre, correo electrónico) para el envío de productos digitales.</li>
                    <li>Credenciales de acceso a la API (tokens) proporcionadas por Tiendanube durante la instalación.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">2. Uso de la Información</h2>
                <p>
                    Utilizamos la información exclusivamente para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Verificar el estado del pago de los pedidos.</li>
                    <li>Entregar automáticamente los enlaces de descarga de productos digitales vinculados.</li>
                    <li>Sincronizar la configuración de botones de compra en su escaparate.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">3. Protección de Datos</h2>
                <p>
                    Nos comprometemos a proteger sus datos y los de sus clientes. No compartimos, vendemos ni alquilamos información personal a terceros. Los datos se almacenan de forma segura y solo se accede a ellos para las funcionalidades principales de la aplicación.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">4. Derechos del Usuario</h2>
                <p>
                    Usted puede desinstalar la aplicación en cualquier momento desde su panel de Tiendanube, lo que revocará nuestro acceso a su tienda. Puede solicitar la eliminación de sus datos enviando un correo a nuestro soporte.
                </p>
            </section>

            <footer className="mt-10 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">Última actualización: Marzo 2026</p>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
