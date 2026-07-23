<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
        $this->configureHttpsForProxies();
    }

    /**
     * When behind ngrok/Cloudflare, force https so Vite/CSS/JS are not mixed-content blocked.
     */
    protected function configureHttpsForProxies(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        $request = request();

        if ($request->header('X-Forwarded-Proto') === 'https' || $request->secure()) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure authorization gates.
     */
    protected function configureAuthorization(): void
    {
        Gate::define('admin', fn ($user) => $user->role === 'admin');
    }
}
