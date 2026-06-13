import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { Devs } from "@utils/constants";
import { findStoreLazy } from "@webpack";
import { UserAreaButton, UserAreaButtonFactory, UserAreaRenderProps } from "@api/UserArea";
import { React, ReactDOM, useState, useEffect } from "@webpack/common";

const SoundboardStore = findStoreLazy("SoundboardStore") as any;
const GuildStore = findStoreLazy("GuildStore") as any;
const UserStore = findStoreLazy("UserStore") as any;

const CURRENT_VERSION = "0.9.0";

const settings = definePluginSettings({
    previewDeviceId: {
        type: OptionType.STRING,
        description: "Preview Device ID",
        default: "default",
        hidden: true,
    },
    micDeviceId: {
        type: OptionType.STRING,
        description: "Mic Device ID",
        default: "default",
        hidden: true,
    },
    localSounds: {
        type: OptionType.STRING,
        default: "[]",
        hidden: true,
    },
    customSound: {
        type: OptionType.COMPONENT,
        component: DeviceSelector,
    }
});

function makeRange(min: number, max: number, step: number) {
    const arr = [];
    for (let i = min; i <= max; i += step) arr.push(i);
    return arr;
}

// Reuse device selector logic
function DeviceSelector() {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(devs => {
            setDevices(devs.filter(d => d.kind === "audiooutput"));
        });
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", marginTop: "10px" }}>
            <div>
                <h4 style={{ color: "#fff", margin: "0 0 8px 0" }}>1. Headset Device (For Previewing Sounds)</h4>
                <select 
                    value={settings.store.previewDeviceId || "default"}
                    onChange={e => settings.store.previewDeviceId = e.target.value}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", background: "#202225", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                    <option value="default">Default</option>
                    {devices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
                    ))}
                </select>
                <div style={{ fontSize: "12px", color: "#949BA4", marginTop: "6px" }}>Select your personal headset. This is used when you click the Preview (Speaker) icon so only you hear it.</div>
            </div>

            <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.05)" }} />

            <div>
                <h4 style={{ color: "#fff", margin: "0 0 8px 0" }}>2. Mic Cable Device (For Playing to Room)</h4>
                <select 
                    value={settings.store.micDeviceId || "default"}
                    onChange={e => settings.store.micDeviceId = e.target.value}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", background: "#202225", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                    <option value="default">Default</option>
                    {devices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
                    ))}
                </select>
                <div style={{ fontSize: "12px", color: "#949BA4", marginTop: "6px" }}>Select your Virtual Audio Cable (e.g., SteelSeries Sonar Mic). This is used when you click the Play button to broadcast to the room.</div>
            </div>
        </div>
    );
}

const SearchIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"/></svg>
);

const StopIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>
);

const PlayIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.14v14l11-7-11-7z"/></svg>
);

const SpeakerIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
);

const StarOutlineIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>
);

const VolumeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
);

const StarIcon = ({ style, selected }: { style?: React.CSSProperties, selected?: boolean }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill={selected ? "currentColor" : "currentColor"} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
);

const ChevronIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
);

const PlusIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
);

const TrashIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15ZM5 6.99902V18.999C5 20.103 5.897 20.999 7 20.999H17C18.103 20.999 19 20.103 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"/></svg>
);

// --- Soundboard UI Popout Component ---

function CustomSoundboardUI({ onClose }: { onClose: () => void }) {
    const [soundsMap, setSoundsMap] = useState<Map<string, any[]>>(new Map());
    const [selectedGuild, setSelectedGuild] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [showVolumePopup, setShowVolumePopup] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(settings.store.volume || 50);
    const [favorites, setFavorites] = useState<string[]>(settings.store.favoriteSounds || []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [localSoundsState, setLocalSoundsState] = useState<any[]>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const activeAudios = React.useRef<HTMLAudioElement[]>([]);

    // User Data
    const currentUser = UserStore?.getCurrentUser?.();
    const currentAvatarUrl = currentUser ? currentUser.getAvatarURL() : "https://cdn.discordapp.com/embed/avatars/0.png";
    const currentUsername = currentUser ? currentUser.username : "My Sounds";

    useEffect(() => {
        try {
            setLocalSoundsState(JSON.parse(settings.store.localSounds || "[]"));
        } catch(e) {}
    }, []);

    const saveLocalSound = (sound: any) => {
        const next = [...localSoundsState, sound];
        setLocalSoundsState(next);
        settings.store.localSounds = JSON.stringify(next);
    };

    const deleteLocalSound = (soundId: string) => {
        const nextLocal = localSoundsState.filter(s => s.soundId !== soundId);
        setLocalSoundsState(nextLocal);
        settings.store.localSounds = JSON.stringify(nextLocal);
    };

    useEffect(() => {
        if (!settings.store.favoriteSounds) {
            settings.store.favoriteSounds = [];
        }
    }, []);

    const stopAllSounds = () => {
        activeAudios.current.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        activeAudios.current = [];
    };

    useEffect(() => {
        if (SoundboardStore) {
            setSoundsMap(SoundboardStore.getSounds());
        }
    }, []);

    const playSound = async (soundId: string) => {
        try {
            const localCustomSound = localSoundsState.find(s => s.soundId === soundId);
            const url = localCustomSound ? localCustomSound.fileUrl : `https://${window.GLOBAL_ENV?.CDN_HOST || "cdn.discordapp.com"}/soundboard-sounds/${soundId}`;
            const audio = new Audio(url);
            let targetVol = currentVolume / 100;
            if (localCustomSound && typeof localCustomSound.volume === 'number') targetVol *= localCustomSound.volume;
            audio.volume = targetVol;
            if (localCustomSound && localCustomSound.startTime) {
                audio.currentTime = localCustomSound.startTime;
            }
            
            activeAudios.current.push(audio);
            audio.onended = () => { activeAudios.current = activeAudios.current.filter(a => a !== audio); };

            if (localCustomSound && localCustomSound.endTime) {
                audio.ontimeupdate = () => {
                    if (audio.currentTime >= localCustomSound.endTime) {
                        audio.pause();
                        audio.ontimeupdate = null;
                        activeAudios.current = activeAudios.current.filter(a => a !== audio);
                    }
                };
            }

            if (settings.store.micDeviceId && settings.store.micDeviceId !== "default") {
                if (typeof (audio as any).setSinkId === "function") {
                    try {
                        await (audio as any).setSinkId(settings.store.micDeviceId);
                    } catch(e) { console.warn("Failed to set sink ID for mic", e); }
                    
                    const localAudio = new Audio(url);
                    let localTargetVol = currentVolume / 100;
                    if (localCustomSound && typeof localCustomSound.volume === 'number') localTargetVol *= localCustomSound.volume;
                    localAudio.volume = localTargetVol;
                    if (localCustomSound && localCustomSound.startTime) {
                        localAudio.currentTime = localCustomSound.startTime;
                    }
                    activeAudios.current.push(localAudio);
                    localAudio.onended = () => { activeAudios.current = activeAudios.current.filter(a => a !== localAudio); };
                    
                    if (localCustomSound && localCustomSound.endTime) {
                        localAudio.ontimeupdate = () => {
                            if (localAudio.currentTime >= localCustomSound.endTime) {
                                localAudio.pause();
                                localAudio.ontimeupdate = null;
                                activeAudios.current = activeAudios.current.filter(a => a !== localAudio);
                            }
                        };
                    }

                    if (settings.store.previewDeviceId && settings.store.previewDeviceId !== "default") {
                        try {
                            await (localAudio as any).setSinkId(settings.store.previewDeviceId);
                        } catch(e) {}
                    }
                    localAudio.play().catch(() => {});
                }
            }
            await audio.play();
        } catch (err) {
            console.error("[CustomSoundboard] Failed to play sound:", err);
        }
    };

    const previewSound = async (soundId: string) => {
        try {
            const localCustomSound = localSoundsState.find(s => s.soundId === soundId);
            const url = localCustomSound ? localCustomSound.fileUrl : `https://cdn.discordapp.com/soundboard-sounds/${soundId}`;
            const localAudio = new Audio(url);
            localAudio.volume = currentVolume / 100;
            if (localCustomSound && localCustomSound.startTime) {
                localAudio.currentTime = localCustomSound.startTime;
            }

            if (localCustomSound && localCustomSound.endTime) {
                localAudio.ontimeupdate = () => {
                    if (localAudio.currentTime >= localCustomSound.endTime) {
                        localAudio.pause();
                        localAudio.ontimeupdate = null;
                    }
                };
            }
            
            if (settings.store.previewDeviceId && settings.store.previewDeviceId !== "default") {
                try {
                    if (typeof (localAudio as any).setSinkId === "function") {
                        await (localAudio as any).setSinkId(settings.store.previewDeviceId);
                    }
                } catch (sinkErr) {
                    console.warn("setSinkId failed, playing on default device", sinkErr);
                }
            }
            localAudio.play().catch(e => console.error("Preview play error:", e));
        } catch (err) {
            console.error("[CustomSoundboard] Failed to preview sound:", err);
        }
    };

    const toggleFavorite = (soundId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const isRemoving = favorites.includes(soundId);
        const next = isRemoving ? favorites.filter(id => id !== soundId) : [...favorites, soundId];
        setFavorites(next);
        settings.store.favoriteSounds = next;
    };

    const allGuilds = Array.from(soundsMap.keys()).filter(guildId => (soundsMap.get(guildId) || []).length > 0);
    const displayGuilds = allGuilds; // Always show all guilds, rely on scrolling
    
    const allSoundsFlat = Array.from(soundsMap.values()).flat().concat(localSoundsState);
    const displayFavorites = favorites.map(id => allSoundsFlat.find(s => s.soundId === id)).filter(Boolean);

    const scrollToGuild = (guildId: string) => {
        setSelectedGuild(guildId);
        const container = document.getElementById("yaser-main-scroll");
        if (!container) return;
        
        if (guildId === "all") {
            container.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const el = document.getElementById(`category-${guildId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    };

    const toggleCategory = (guildId: string) => {
        const next = new Set(collapsedCategories);
        if (next.has(guildId)) next.delete(guildId);
        else next.add(guildId);
        setCollapsedCategories(next);
    };

    const handleVolumeChange = (e: any) => {
        const val = parseInt(e.target.value);
        setCurrentVolume(val);
        settings.store.volume = val;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "rgba(17, 18, 20, 0.75)", backdropFilter: "blur(24px)", overflowX: "hidden", color: "#fff" }}>
            <style>{`
                .yaser-soundboard-sidebar::-webkit-scrollbar { display: none; }
                .yaser-soundboard-main::-webkit-scrollbar { width: 6px; }
                .yaser-soundboard-main::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
                .yaser-soundboard-main::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
                .yaser-soundboard-main::-webkit-scrollbar-track { background: transparent; }
                
                .sound-card-yaser { 
                    position: relative; 
                    background: rgba(255, 255, 255, 0.08); 
                    border: 1px solid rgba(255, 255, 255, 0.05); 
                    border-radius: 8px; 
                    padding: 8px 12px; 
                    display: flex; 
                    align-items: center; 
                    gap: 10px; 
                    cursor: pointer; 
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 48px;
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .sound-card-yaser:hover { 
                    background: rgba(255, 255, 255, 0.15); 
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
                
                .sound-card-yaser .hover-actions-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(40, 42, 46, 0.95);
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 12px;
                    opacity: 0; pointer-events: none;
                    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sound-card-yaser:hover .hover-actions-overlay {
                    opacity: 1; pointer-events: auto;
                }

                .premium-action-btn {
                    display: flex; justify-content: center; align-items: center;
                    width: 32px; height: 32px; border-radius: 50%;
                    color: #B5BAC1; transition: all 0.2s;
                    background: transparent;
                }
                .premium-action-btn:hover {
                    background: rgba(255, 255, 255, 0.1); color: #fff;
                    transform: scale(1.1);
                }

                /* Premium Tooltips */
                .has-tooltip { position: relative; }
                .has-tooltip::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1);
                    color: #DBDEE1; padding: 6px 12px; border-radius: 6px;
                    font-size: 13px; font-weight: 500; white-space: nowrap;
                    opacity: 0; pointer-events: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999999;
                    transform: translate(-50%, 4px) scale(0.95);
                }
                .has-tooltip:hover::after { opacity: 1; transform: translate(-50%, 0) scale(1); transition-delay: 0.1s; }

                .tooltip-top::after { bottom: calc(100% + 8px); left: 50%; }
                .tooltip-right::after { left: calc(100% + 8px); top: 50%; transform: translate(4px, -50%) scale(0.95); }
                .has-tooltip.tooltip-right:hover::after { transform: translate(0, -50%) scale(1); }
            `}</style>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: "rgba(0,0,0,0.2)", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center", padding: "0 12px", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s", height: "36px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
                     onFocus={e => { e.currentTarget.style.borderColor = "#5865F2"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(88, 101, 242, 0.2), inset 0 2px 4px rgba(0,0,0,0.2)"; }}
                     onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)"; }}
                >
                    <SearchIcon style={{ width: 18, height: 18, color: "#949BA4", marginLeft: "4px" }} />
                    <input 
                        type="text" 
                        placeholder="Find the perfect sound" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1, background: "transparent", border: "none", color: "#DBDEE1", padding: "0", outline: "none", fontSize: "14px", height: "100%" }}
                    />
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div onClick={stopAllSounds} style={{ cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.1s", color: "#F23F43" }} title="Stop all sounds" onMouseOver={e => e.currentTarget.style.color = "#ff5252"} onMouseOut={e => e.currentTarget.style.color = "#F23F43"}>
                        <StopIcon style={{ width: 22, height: 22 }} />
                    </div>
                    <div onClick={() => setShowVolumePopup(!showVolumePopup)} style={{ cursor: "pointer", display: "flex", alignItems: "center", color: showVolumePopup ? "#DBDEE1" : "#B5BAC1", transition: "color 0.1s" }} title="Volume Control" onMouseOver={e => e.currentTarget.style.color = "#DBDEE1"} onMouseOut={e => { if(!showVolumePopup) e.currentTarget.style.color = "#B5BAC1"; }}>
                        <VolumeIcon style={{ width: 24, height: 24 }} />
                    </div>
                </div>

                {showVolumePopup && (
                    <div style={{ position: "absolute", top: "60px", right: "20px", background: "rgba(20, 20, 25, 0.95)", backdropFilter: "blur(16px)", padding: "16px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", zIndex: 10, display: "flex", flexDirection: "column", gap: "12px", width: "180px" }}>
                        <div style={{ color: "#DBDEE1", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Soundboard Volume</div>
                        <input type="range" min="0" max="100" value={currentVolume} onChange={handleVolumeChange} style={{ width: "100%", accentColor: "#5865F2", cursor: "pointer" }} />
                    </div>
                )}
            </div>
            
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Sidebar */}
                <div className="yaser-soundboard-sidebar" style={{ width: "64px", background: "rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", padding: "12px 0", gap: "12px", borderRight: "1px solid rgba(255,255,255,0.02)" }}>
                    <div 
                        onClick={() => scrollToGuild("all")}
                        className="has-tooltip tooltip-right"
                        data-tooltip="Favorites"
                        style={{
                            width: "100%", height: "48px",
                            display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer",
                            position: "relative"
                        }}
                    >
                        {selectedGuild === "all" && <div style={{ position: "absolute", left: "-2px", width: "4px", height: "32px", background: "#fff", borderRadius: "0 4px 4px 0", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />}
                        <div style={{
                            width: "36px", height: "36px", borderRadius: selectedGuild === "all" ? "12px" : "18px",
                            display: "flex", justifyContent: "center", alignItems: "center",
                            background: selectedGuild === "all" ? "rgba(88, 101, 242, 0.2)" : "rgba(255,255,255,0.05)", 
                            color: selectedGuild === "all" ? "#fff" : "#949BA4",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: selectedGuild === "all" ? "0 0 12px rgba(88, 101, 242, 0.3)" : "none"
                        }}>
                            <StarIcon style={{ width: 24, height: 24 }} selected={selectedGuild === "all"} />
                        </div>
                    </div>

                    <div 
                        onClick={() => scrollToGuild("local-sounds")}
                        className="has-tooltip tooltip-right"
                        data-tooltip={currentUsername}
                        style={{ width: "100%", height: "48px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", position: "relative" }}
                    >
                        {selectedGuild === "local-sounds" && <div style={{ position: "absolute", left: "-2px", width: "4px", height: "32px", background: "#fff", borderRadius: "0 4px 4px 0", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />}
                        <div style={{
                            width: "36px", height: "36px", borderRadius: selectedGuild === "local-sounds" ? "12px" : "18px",
                            display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden",
                            background: selectedGuild === "local-sounds" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)", 
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: selectedGuild === "local-sounds" ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
                        }}>
                            <img src={currentAvatarUrl} style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
                        </div>
                    </div>

                    <div style={{ width: "32px", height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "1px", margin: "4px 0" }} />
                    {allGuilds.map(guildId => {
                        const guild = GuildStore?.getGuild(guildId);
                        if (!guild) return null;
                        const isActive = selectedGuild === guildId;
                        return (
                            <div key={guildId} onClick={() => scrollToGuild(guildId)} className="has-tooltip tooltip-right" data-tooltip={guild.name} style={{ position: "relative", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "48px" }}>
                                {isActive && <div style={{ position: "absolute", left: "-2px", width: "4px", height: "32px", background: "#fff", borderRadius: "0 4px 4px 0", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />}
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: isActive ? "12px" : "18px",
                                    background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
                                    display: "flex", justifyContent: "center", alignItems: "center",
                                    color: "#DBDEE1", fontSize: "12px", fontWeight: 600, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                                    overflow: "hidden"
                                }}>
                                    {guild.icon ? (
                                        <img src={`https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.webp?size=64`} style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
                                    ) : (
                                        guild.name.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Main Content */}
                <div id="yaser-main-scroll" className="yaser-soundboard-main" style={{ flex: 1, background: "transparent", overflowY: "auto", overflowX: "hidden", padding: "20px" }}>
                    {displayFavorites.length > 0 && (
                        <div id="category-all" style={{ marginBottom: "32px" }}>
                            <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                                <div style={{ width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(241, 196, 15, 0.2)", borderRadius: "6px", color: "#F1C40F" }}>
                                    <StarIcon style={{ width: 16, height: 16 }} selected={true} />
                                </div>
                                <span style={{ marginRight: "4px", letterSpacing: "0.5px" }}>Favorites</span>
                                
                                <div onClick={(e) => { e.stopPropagation(); toggleCategory("favorites"); }} style={{ cursor: "pointer", padding: "4px" }}>
                                    <ChevronIcon style={{ width: 18, height: 18, color: "rgba(255,255,255,0.5)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: collapsedCategories.has("favorites") ? "rotate(-90deg)" : "rotate(0deg)" }} />
                                </div>
                            </h3>
                            {!collapsedCategories.has("favorites") && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                    {displayFavorites.map(sound => (
                                        <div key={`fav-${sound.soundId}`} className="sound-card-yaser" onClick={() => playSound(sound.soundId)}>
                                            <div className="normal-content" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                                                {sound.emojiName && (
                                                    <div style={{ fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                                                        {sound.emojiName}
                                                    </div>
                                                )}
                                                <span style={{ 
                                                    fontSize: "13px", fontWeight: 600, 
                                                    textAlign: sound.emojiName ? "left" : "center", flex: 1,
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                    textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                                                }}>
                                                    {sound.name}
                                                </span>
                                            </div>

                                            <div className="hover-actions-overlay">
                                                <div className="premium-action-btn has-tooltip tooltip-top" data-tooltip="Preview locally" onClick={(e) => { e.preventDefault(); e.stopPropagation(); previewSound(sound.soundId); }}>
                                                    <SpeakerIcon style={{ width: 18, height: 18 }} />
                                                </div>
                                                <span style={{ 
                                                    fontSize: "14px", fontWeight: 700, 
                                                    textAlign: "center", flex: 1,
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                    color: "#fff", pointerEvents: "none"
                                                }}>
                                                    {sound.name}
                                                </span>
                                                <div className="premium-action-btn has-tooltip tooltip-top" data-tooltip="Remove Favorite" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(sound.soundId, e); }}>
                                                    <StarIcon style={{ width: 18, height: 18, color: "#F1C40F", filter: "drop-shadow(0 0 4px rgba(241, 196, 15, 0.5))" }} selected={true} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div id="category-local-sounds" style={{ marginBottom: "32px" }}>
                        <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                            <div style={{ width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                                <img src={currentAvatarUrl} style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
                            </div>
                            <span style={{ marginRight: "4px", letterSpacing: "0.5px", flex: 1 }}>{currentUsername}</span>
                            
                            <div className="has-tooltip tooltip-top" data-tooltip="Add Custom Sound" onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.05)", transition: "all 0.2s" }}>
                                <PlusIcon style={{ width: 18, height: 18, color: "rgba(255,255,255,0.7)" }} />
                            </div>
                            <div className="has-tooltip tooltip-top" data-tooltip="Delete Mode" onClick={(e) => { e.stopPropagation(); setIsDeleteMode(!isDeleteMode); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: isDeleteMode ? "rgba(242, 63, 66, 0.2)" : "rgba(255,255,255,0.05)", transition: "all 0.2s" }}>
                                <TrashIcon style={{ width: 18, height: 18, color: isDeleteMode ? "#F23F42" : "rgba(255,255,255,0.7)" }} />
                            </div>
                            <div onClick={(e) => { e.stopPropagation(); toggleCategory("local-sounds"); }} style={{ cursor: "pointer", padding: "4px" }}>
                                <ChevronIcon style={{ width: 18, height: 18, color: "rgba(255,255,255,0.5)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: collapsedCategories.has("local-sounds") ? "rotate(-90deg)" : "rotate(0deg)" }} />
                            </div>
                        </h3>
                        {!collapsedCategories.has("local-sounds") && localSoundsState.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                {localSoundsState.map(sound => (
                                    <div key={sound.soundId} className={`sound-card-yaser ${isDeleteMode ? 'delete-mode-jiggle' : ''}`} onClick={() => {
                                        if (isDeleteMode) deleteLocalSound(sound.soundId);
                                        else playSound(sound.soundId);
                                    }}>
                                        <div className="normal-content" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                                            {sound.emojiName && <div style={{ fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>{sound.emojiName}</div>}
                                            <span style={{ fontSize: "13px", fontWeight: 600, textAlign: sound.emojiName ? "left" : "center", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{sound.name}</span>
                                        </div>

                                        {!isDeleteMode && (
                                            <div className="hover-actions-overlay">
                                                <div className="premium-action-btn has-tooltip tooltip-top" data-tooltip="Preview locally" onClick={(e) => { e.preventDefault(); e.stopPropagation(); previewSound(sound.soundId); }}>
                                                    <SpeakerIcon style={{ width: 18, height: 18 }} />
                                                </div>
                                                <span style={{ 
                                                    fontSize: "14px", fontWeight: 700, 
                                                    textAlign: "center", flex: 1,
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                    color: "#fff", pointerEvents: "none"
                                                }}>
                                                    {sound.name}
                                                </span>
                                                <div className="premium-action-btn has-tooltip tooltip-top" data-tooltip="Favorite" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(sound.soundId, e); }}>
                                                    {favorites.includes(sound.soundId) ? <StarIcon style={{ width: 18, height: 18, color: "#F1C40F", filter: "drop-shadow(0 0 4px rgba(241, 196, 15, 0.5))" }} selected={true} /> : <StarOutlineIcon style={{ width: 18, height: 18 }} />}
                                                </div>
                                            </div>
                                        )}
                                        {isDeleteMode && (
                                            <div style={{ position: "absolute", top: -6, right: -6, width: 24, height: 24, background: "#F23F42", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.5)", border: "2px solid #1E1F22", zIndex: 10 }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <style>{`
                            @keyframes jiggle { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1.5deg); } 100% { transform: rotate(-1deg); } }
                            .delete-mode-jiggle { animation: jiggle 0.3s infinite; box-shadow: 0 0 8px rgba(242, 63, 66, 0.4) !important; border: 1px solid rgba(242, 63, 66, 0.5) !important; cursor: pointer !important; }
                            .delete-mode-jiggle:hover { background: rgba(242, 63, 66, 0.15) !important; transform: scale(1.02) rotate(0deg); animation: none; }
                        `}</style>
                    </div>

                    {displayGuilds.map(guildId => {
                        const guild = GuildStore?.getGuild(guildId);
                        const guildSounds = (soundsMap.get(guildId) || []).filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
                        if (!guild || guildSounds.length === 0) return null;
                        
                        const isCollapsed = collapsedCategories.has(guildId);

                        return (
                            <div id={`category-${guildId}`} key={guildId} style={{ marginBottom: "32px" }}>
                                <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                                    <div style={{ width: 24, height: 24, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                                        {guild.icon ? (
                                            <img src={`https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.webp?size=32`} style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 800 }}>{guild.name.substring(0,1)}</div>
                                        )}
                                    </div>
                                    <span style={{ marginRight: "4px", letterSpacing: "0.5px" }}>{guild.name}</span>
                                    <div onClick={(e) => { e.stopPropagation(); toggleCategory(guildId); }} style={{ cursor: "pointer", padding: "4px" }}>
                                        <ChevronIcon style={{ width: 18, height: 18, color: "rgba(255,255,255,0.5)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }} />
                                    </div>
                                </h3>
                                {!isCollapsed && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                        {guildSounds.map(sound => (
                                            <div key={sound.soundId} className="sound-card-yaser" onClick={() => playSound(sound.soundId)}>
                                                <div className="normal-content" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                                                    {sound.emojiName && (
                                                        <div style={{ fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "24px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                                                            {sound.emojiName}
                                                        </div>
                                                    )}
                                                    <span style={{ 
                                                        fontSize: "13px", fontWeight: 600, 
                                                        textAlign: sound.emojiName ? "left" : "center", flex: 1,
                                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                        textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                                                    }}>
                                                        {sound.name}
                                                    </span>
                                                </div>

                                                <div className="hover-actions-overlay">
                                                    <div className="premium-action-btn has-tooltip tooltip-top" data-tooltip="Preview locally" onClick={(e) => { e.preventDefault(); e.stopPropagation(); previewSound(sound.soundId); }}>
                                                        <SpeakerIcon style={{ width: 18, height: 18 }} />
                                                    </div>
                                                    <span style={{ 
                                                        fontSize: "14px", fontWeight: 700, 
                                                        textAlign: "center", flex: 1,
                                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                        color: "#fff", pointerEvents: "none"
                                                    }}>
                                                        {sound.name}
                                                    </span>
                                                    <div className="premium-action-btn has-tooltip tooltip-top" data-tooltip="Favorite" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(sound.soundId, e); }}>
                                                        {favorites.includes(sound.soundId) ? (
                                                            <StarIcon style={{ width: 18, height: 18, color: "#F1C40F", filter: "drop-shadow(0 0 4px rgba(241, 196, 15, 0.5))" }} selected={true} />
                                                        ) : (
                                                            <StarOutlineIcon style={{ width: 18, height: 18 }} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {showAddModal && <AddSoundModal onClose={() => setShowAddModal(false)} saveLocalSound={saveLocalSound} />}
            </div>
        </div>
    );
}

const COMMON_EMOJIS = ["😂", "😭", "💀", "👀", "🔥", "💯", "✨", "❤️", "👍", "🤔", "🥺", "🤡", "🤓", "😎", "😡", "😱", "🎉", "💩", "✅", "❌", "🔊", "🎶", "🎵", "🎤", "🎧"];

function AddSoundModal({ onClose, saveLocalSound }: { onClose: () => void, saveLocalSound: (sound: any) => void }) {
    const [fileUrl, setFileUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);

    const fakeWaveform = React.useMemo(() => Array.from({length: 60}).map(() => 20 + Math.random() * 80), [fileUrl]);

    useEffect(() => {
        return () => { if (previewAudioRef.current) previewAudioRef.current.pause(); };
    }, []);

    const playPreview = () => {
        if (!fileUrl) return;
        if (previewAudioRef.current) {
            if (isPlaying) {
                previewAudioRef.current.pause();
                setIsPlaying(false);
                return;
            } else {
                previewAudioRef.current.pause();
            }
        }
        setIsPlaying(true);
        const audio = new Audio(fileUrl);
        audio.currentTime = startTime;
        audio.volume = volume;
        audio.play();
        audio.ontimeupdate = () => {
            if (audio.currentTime >= endTime) {
                audio.pause();
                setIsPlaying(false);
            }
        };
        audio.onended = () => setIsPlaying(false);
        previewAudioRef.current = audio;
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            let url = "";
            if (file.path) url = "file://" + file.path.replace(/\\/g, "/");
            else url = URL.createObjectURL(file);
            setFileUrl(url);

            const audio = new Audio(url);
            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
                setStartTime(0);
                setEndTime(audio.duration);
            };
        }
    };

    const cutDuration = endTime - startTime;
    const isValid = fileUrl ? (cutDuration > 0 && cutDuration <= 30) : false;
    const durationColor = fileUrl ? (isValid ? "#43b581" : "#faa61a") : "#B5BAC1";

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999999, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div style={{ width: "440px", background: "rgba(30, 31, 34, 0.95)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", padding: "24px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "20px" }} onClick={e => { e.stopPropagation(); setShowEmojiPicker(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, color: "#fff", fontSize: "20px", fontWeight: 700 }}>Upload a Sound</h2>
                    <div style={{ cursor: "pointer", color: "#B5BAC1" }} onClick={onClose}><svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18.4 4L12 10.4 5.6 4 4 5.6 10.4 12 4 18.4 5.6 20 12 13.6 18.4 20 20 18.4 13.6 12 20 5.6z"/></svg></div>
                </div>

                <div>
                    <label style={{ display: "block", color: "#B5BAC1", fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>Preview</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#111214", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", opacity: fileUrl ? 1 : 0.4, transition: "opacity 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                <div onClick={playPreview} style={{ cursor: fileUrl ? "pointer" : "default", color: "#fff", width: 28, height: 28, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}>
                                    {isPlaying ? (
                                        <svg width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                        <PlayIcon style={{ width: 16, height: 16, marginLeft: "2px" }} />
                                    )}
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: durationColor }}>{fileUrl ? cutDuration.toFixed(2) : "0.00"}s</span>
                            </div>
                            <div style={{ position: "relative", flex: 1, height: "48px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "2px", width: "100%", height: "100%", opacity: 0.3 }}>
                                    {fakeWaveform.map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, background: "#fff", borderRadius: "1px" }} />)}
                                </div>
                                {fileUrl && (
                                    <>
                                        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(startTime / duration) * 100}%`, width: `${((endTime - startTime) / duration) * 100}%`, background: "rgba(88, 101, 242, 0.3)", borderLeft: "2px solid #5865F2", borderRight: "2px solid #5865F2", pointerEvents: "none" }} />
                                        <input type="range" min={0} max={duration} step={0.01} value={startTime} onChange={e => { setStartTime(Math.min(Number(e.target.value), endTime - 0.1)); setIsPlaying(false); if(previewAudioRef.current) previewAudioRef.current.pause(); }} className="yaser-trim-slider" style={{ position: "absolute", inset: 0, zIndex: 3 }} />
                                        <input type="range" min={0} max={duration} step={0.01} value={endTime} onChange={e => { setEndTime(Math.max(Number(e.target.value), startTime + 0.1)); setIsPlaying(false); if(previewAudioRef.current) previewAudioRef.current.pause(); }} className="yaser-trim-slider" style={{ position: "absolute", inset: 0, zIndex: 4 }} />
                                    </>
                                )}
                                <style>{`
                                    .yaser-trim-slider { width: 100%; height: 100%; appearance: none; background: transparent; pointer-events: none; outline: none; margin: 0; }
                                    .yaser-trim-slider::-webkit-slider-thumb { appearance: none; pointer-events: auto; width: 8px; height: 48px; background: #fff; border-radius: 4px; cursor: ew-resize; box-shadow: 0 0 4px rgba(0,0,0,0.5); }
                                `}</style>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <VolumeIcon style={{ width: 16, height: 16, color: "#949BA4" }} />
                            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => { setVolume(Number(e.target.value)); if(previewAudioRef.current) previewAudioRef.current.volume = Number(e.target.value); }} style={{ flex: 1, accentColor: "#5865F2", cursor: "pointer", height: "4px" }} />
                        </div>
                    </div>
                </div>
                
                <div>
                    <label style={{ display: "block", color: "#B5BAC1", fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>File <span style={{ color: "#F23F42" }}>*</span></label>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#111214", borderRadius: "8px", padding: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <label style={{ background: "#5865F2", color: "#fff", padding: "6px 16px", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#4752C4"} onMouseOut={e => e.currentTarget.style.background = "#5865F2"}>
                            Browse
                            <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: "none" }} />
                        </label>
                        <span style={{ fontSize: "13px", color: fileName ? "#DBDEE1" : "#80848E", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {fileName || "No file chosen"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", color: "#B5BAC1", fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>Sound Name <span style={{ color: "#F23F42" }}>*</span></label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sound Name" style={{ width: "100%", padding: "10px", background: "#111214", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                        <label style={{ display: "block", color: "#B5BAC1", fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>Related Emoji</label>
                        <div 
                            onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} 
                            style={{ cursor: "pointer", width: "100%", padding: "10px", background: "#111214", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: emoji ? "#fff" : "#80848E", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}
                        >
                            <span style={{ fontSize: emoji ? "18px" : "14px" }}>{emoji || "Select Emoji"}</span>
                            <ChevronIcon style={{ width: 16, height: 16, transform: showEmojiPicker ? "rotate(-180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                        </div>
                        
                        {showEmojiPicker && (
                            <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: "8px", width: "100%", background: "#2B2D31", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px", zIndex: 10, boxShadow: "0 -8px 16px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
                                {COMMON_EMOJIS.map(e => (
                                    <div key={e} onClick={() => { setEmoji(e); setShowEmojiPicker(false); }} style={{ cursor: "pointer", fontSize: "20px", padding: "6px", textAlign: "center", borderRadius: "4px", transition: "background 0.2s" }} onMouseOver={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseOut={ev => ev.currentTarget.style.background = "transparent"}>
                                        {e}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px", justifyContent: "flex-end" }}>
                    <button style={{ padding: "10px 24px", background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600 }} onClick={onClose}>Never mind</button>
                    <button 
                        style={{ padding: "10px 24px", background: isValid ? "#24806A" : "#1A5C4C", opacity: isValid ? 1 : 0.5, borderRadius: "8px", border: "none", color: "#fff", cursor: isValid ? "pointer" : "not-allowed", fontWeight: 600, transition: "all 0.2s" }} 
                        onClick={() => {
                            if (fileUrl && name.trim() && isValid) {
                                saveLocalSound({
                                    soundId: "local-" + Date.now(),
                                    name: name.trim(),
                                    emojiName: emoji.trim(),
                                    fileUrl,
                                    startTime,
                                    endTime,
                                    volume
                                });
                                onClose();
                            }
                        }}
                    >Upload</button>
                </div>
            </div>
        </div>
    );
}

// --- Megaphone Icon ---
function MegaphoneIcon({ active = false, className = "" }: { active?: boolean; className?: string; }) {
    return (
        <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={active ? "currentColor" : "var(--interactive-normal)"}
        >
            <path d="M11 2.04932C11 1.48835 11.5312 1.07746 12.0722 1.25781C16.8507 2.8521 21 8.3514 21 12.0004C21 15.6495 16.8507 21.1488 12.0722 22.7431C11.5312 22.9234 11 22.5125 11 21.9515V15H8C5.79086 15 4 13.2091 4 11V10C4 7.79086 5.79086 6 8 6H11V2.04932Z" />
        </svg>
    );
}

function CustomSoundboardButton({ iconForeground, hideTooltips, nameplate }: UserAreaRenderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const buttonRef = React.useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            setRect(buttonRef.current.getBoundingClientRect());
        }
        setIsOpen(!isOpen);
    };

    // Close when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            setIsOpen(false);
        };
        setTimeout(() => document.addEventListener("click", handleClickOutside), 10);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    return (
        <div style={{ position: "relative", display: "flex" }} ref={buttonRef} onClick={e => e.stopPropagation()}>
            <UserAreaButton
                tooltipText={hideTooltips ? void 0 : "Custom Soundboard"}
                icon={<MegaphoneIcon className={iconForeground} active={isOpen} />}
                plated={nameplate != null}
                onClick={toggleOpen}
            />
            {isOpen && rect && ReactDOM.createPortal(
                <>
                    <div 
                        onClick={() => setIsOpen(false)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.01)", zIndex: 2147483646 }}
                    />
                    <div 
                        onClick={e => e.stopPropagation()}
                        style={{
                            position: "fixed",
                            bottom: window.innerHeight - rect.top + 16,
                            left: rect.left,
                            width: "600px",
                            height: "500px",
                            background: "transparent",
                            borderRadius: "16px",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                            zIndex: 2147483647,
                            overflow: "hidden",
                            opacity: 1,
                            animation: "yaser-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
                        }}
                    >
                        <style>{`
                            @keyframes yaser-pop {
                                0% { opacity: 0; transform: translateY(10px) scale(0.98); }
                                100% { opacity: 1; transform: translateY(0) scale(1); }
                            }
                        `}</style>
                        <CustomSoundboardUI onClose={() => setIsOpen(false)} />
                    </div>
                </>, document.body
            )}
        </div>
    );
}

const userAreaButtonRender: UserAreaButtonFactory = props => <CustomSoundboardButton {...props} />;

export default definePlugin({
    name: "yaserCustomSoundboard",
    description: "Free Custom Soundboard! Shows sounds from all your servers. Bypasses Nitro restrictions by playing locally and routing to your mic using your Output Device (like SteelSeries Sonar).",
    tags: ["Voice", "Media"],
    authors: [Devs.TheArmagan],
    settings,
    dependencies: ["UserAreaAPI"],
    userAreaButton: {
        icon: MegaphoneIcon,
        render: userAreaButtonRender
    }
});
