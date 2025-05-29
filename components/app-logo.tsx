export default function AppLogo(props: { logoClassName?: string, logoTextClassName?: string }) {
    return <div className="flex items-center gap-2">
        <img src="/logo.png" alt="TalentFilterAI" className={`w-10 h-auto ${props.logoClassName}`} />
        <span className={`text-2xl font-bold ${props.logoTextClassName}`}>TalentFilterAI</span>
    </div>
}