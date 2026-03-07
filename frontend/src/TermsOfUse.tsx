import React from 'react';

const TermsOfUse: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Términos de Uso - ZeroCart</h1>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                <p>
                    Al instalar y utilizar la aplicación ZeroCart, usted acepta estar sujeto a estos Términos de Uso y a todas las leyes y regulaciones aplicables.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
                <p>
                    ZeroCart proporciona una herramienta de automatización para la venta y entrega de productos digitales dentro de la plataforma Tiendanube. No somos responsables de la calidad o legalidad de los productos digitales que usted venda a través de nuestra herramienta.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">3. Tarifas y Comisiones</h2>
                <p>
                    ZeroCart puede cobrar una comisión por transacción o una suscripción mensual según el plan elegido. Al utilizar el servicio, usted acepta el modelo de cobro especificado en la configuración de la aplicación dentro de su panel de Tiendanube.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">4. Limitación de Responsabilidad</h2>
                <p>
                    ZeroCart no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar el servicio, incluyendo pero no limitado a la interrupción del negocio o la pérdida de beneficios.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">5. Modificaciones</h2>
                <p>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la aplicación después de cualquier cambio constituye su aceptación de los nuevos términos.
                </p>
            </section>

            <footer className="mt-10 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">Última actualización: Marzo 2026</p>
            </footer>
        </div>
    );
};

export default TermsOfUse;
