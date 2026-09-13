<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    /**
     * Tampilkan Halaman Panduan Pemakaian untuk Orang Awam & Pemilik Usaha
     */
    public function index(): Response
    {
        return Inertia::render('Guide/Index');
    }
}
