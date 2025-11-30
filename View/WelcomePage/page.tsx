import { Button } from "@/components/ui/button"
import { ArrowRight, Heart } from "lucide-react"

export default function Home() {
  return (
    <main className="h-screen bg-gradient-to-b from-background to-background flex items-center justify-center px-4">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-primary">CareLink</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              LOGIN
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              REGISTER
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="w-full h-screen max-w-full mx-auto pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center h-full">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in px-4 md:px-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">CareLink</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
                Book appointments with trusted doctors in just a few clicks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 group">
                LOGIN
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                REGISTER
              </Button>
            </div>
          </div>

          {/* Right Illustration - Made image bigger and fill the right side */}
          <div className="relative animate-slide-in-right w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src="/P2-EWjdWS36MZgxQyok7x5i0SL1LvXgon.png"
              alt="Healthcare professionals providing patient care"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
