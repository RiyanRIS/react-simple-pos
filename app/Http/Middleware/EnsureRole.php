<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        if (!empty($roles) && !in_array($request->user()->role, $roles)) {
            return redirect()->route('pos.index')->with('error', 'Akses Ditolak: Halaman tersebut hanya dapat diakses oleh Pemilik (Owner).');
        }

        return $next($request);
    }
}
