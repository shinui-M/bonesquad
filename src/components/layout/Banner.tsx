'use client'

export default function Banner() {
  return (
    <div className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💀</span>
            <div>
              <h1 className="text-2xl font-bold">뼈갈단</h1>
              <p className="text-red-100 text-sm">함께 성장하는 스터디 그룹</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-red-100">
            <span>🔥</span>
            <span className="text-sm">뼈를 갈아서라도 성공하자!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
