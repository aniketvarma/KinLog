import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  Activity,
  LineChart,
  ShieldCheck,
  Smartphone,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">KinLog</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button className="rounded-full px-6">Log In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Your Health, Visualized
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Track your vitals <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              without the clutter.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            KinLog makes logging your daily blood pressure, glucose, and medications effortless. Get intelligent insights and beautiful heatmaps—all in one secure place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/login">
              <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-lg shadow-primary/20 gap-2">
                Start Tracking for Free <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof (Abstract) */}
      <section className="py-10 border-y border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="py-4 md:py-0">
              <p className="text-3xl font-bold mb-1">100%</p>
              <p className="text-sm text-muted-foreground">Private & Secure</p>
            </div>
            <div className="py-4 md:py-0">
              <p className="text-3xl font-bold mb-1">30</p>
              <p className="text-sm text-muted-foreground">Day trend maps</p>
            </div>
            <div className="py-4 md:py-0">
              <p className="text-3xl font-bold mb-1">0</p>
              <p className="text-sm text-muted-foreground">Ads, ever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Zig-Zag */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, stress-free logging.</h2>
              <p className="text-lg text-muted-foreground">
                Keeping track of your health shouldn't be complicated. Our clear, easy-to-read forms give you instant color-coded feedback so you know exactly where you stand.
              </p>
              <ul className="space-y-3">
                {['Instant feedback (Normal, Elevated, High)', 'Large, easy-to-read numbers', 'Seamless tracking for Blood Pressure & Glucose'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full aspect-square md:aspect-auto md:h-[400px] bg-muted/50 rounded-3xl border border-border/50 relative overflow-hidden flex items-center justify-center shadow-sm">
               {/* Abstract Mockup representation */}
               <div className="w-3/4 h-3/4 bg-background rounded-2xl shadow-xl border border-border/50 flex flex-col p-6 gap-4">
                  <div className="h-8 w-1/2 bg-muted rounded-md mb-4"></div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-20 bg-primary/10 rounded-xl border border-primary/20"></div>
                    <div className="flex-1 h-20 bg-blue-500/10 rounded-xl border border-blue-500/20"></div>
                  </div>
                  <div className="h-10 w-full bg-green-500/20 rounded-lg mt-auto border border-green-500/30 flex items-center justify-center">
                    <div className="w-1/3 h-2 bg-green-600/40 rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Clear, visual insights.</h2>
              <p className="text-lg text-muted-foreground">
                Don't just stare at a list of numbers. See your actual progress. Our daily streak tracker helps you stay motivated and build healthy habits, while our simple charts make it easy to spot trends over time.
              </p>
              <ul className="space-y-3">
                {['Daily health streaks to keep you motivated', 'Simple charts with clear safe zones', 'Automatically tracked averages'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full aspect-square md:aspect-auto md:h-[400px] bg-muted/50 rounded-3xl border border-border/50 relative overflow-hidden flex items-center justify-center shadow-sm">
               {/* Abstract Mockup representation */}
               <div className="w-3/4 h-3/4 bg-background rounded-2xl shadow-xl border border-border/50 flex flex-col p-6 gap-4">
                  <div className="h-6 w-1/3 bg-muted rounded-md mb-2"></div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({length: 21}).map((_, i) => (
                      <div key={i} className={`aspect-square rounded-sm ${i % 4 === 0 ? 'bg-red-500/40' : i % 3 === 0 ? 'bg-green-500/80' : 'bg-green-500/40'}`}></div>
                    ))}
                  </div>
                  <div className="flex-1 mt-4 border-t border-border/50 pt-4 relative">
                     {/* Fake chart line */}
                     <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                       <path d="M0,30 Q20,10 40,20 T80,10 T100,5" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary opacity-50" />
                     </svg>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px bg-border -z-10 -translate-y-1/2"></div>
            
            <div className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-md shadow-primary/20">1</div>
              <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Sign Up</h3>
              <p className="text-muted-foreground text-sm">Create your free account instantly using Google or email OTP. Your data is encrypted and private.</p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-md shadow-primary/20">2</div>
              <Smartphone className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Log Daily</h3>
              <p className="text-muted-foreground text-sm">Take a few seconds each day to log your BP or Glucose. Add your medicines to keep track.</p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm relative">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-md shadow-primary/20">3</div>
              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">See Trends</h3>
              <p className="text-muted-foreground text-sm">Watch your dashboard populate with actionable insights, charts, and streaks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to take control?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join users who are building healthier habits by tracking their vitals with KinLog.
          </p>
          <Link to="/login">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-lg shadow-primary/20">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HeartPulse className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">KinLog</span>
        </div>
        <p>&copy; {new Date().getFullYear()} KinLog. All rights reserved.</p>
      </footer>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
