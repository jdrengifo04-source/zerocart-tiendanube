import { Field, FieldGroup, FieldLabel } from "./ui/field"
import { Switch } from "./ui/switch"

export function SwitchSizes() {
    return (
        <div className="p-8 bg-[var(--bg-app)] min-h-screen">
            <div className="max-w-md mx-auto bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)] shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-[var(--text-main)]">Configuración de Tamaños</h2>
                <FieldGroup className="w-full">
                    <Field orientation="horizontal" className="justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700">
                        <FieldLabel htmlFor="switch-size-sm" className="cursor-pointer">Pequeño (sm)</FieldLabel>
                        <Switch id="switch-size-sm" size="sm" />
                    </Field>

                    <Field orientation="horizontal" className="justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700">
                        <FieldLabel htmlFor="switch-size-default" className="cursor-pointer">Predeterminado (default)</FieldLabel>
                        <Switch id="switch-size-default" size="default" />
                    </Field>
                </FieldGroup>
            </div>
        </div>
    )
}
