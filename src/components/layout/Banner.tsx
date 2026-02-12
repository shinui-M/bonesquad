'use client'

export default function Banner() {
  return (
    <div
      className="w-full text-white relative overflow-hidden"
      style={{
        backgroundImage: 'url(/banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💀</span>
            <div>
              <h1 className="text-3xl font-bold drop-shadow-lg">뼈갈단</h1>
              <p className="text-white/90 text-sm drop-shadow">함께 성장하는 스터디 그룹</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/90">
            <span>🔥</span>
            <span className="text-sm drop-shadow">뼈를 갈아서라도 성공하자!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
