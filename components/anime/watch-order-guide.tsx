"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { watchOrderGuides } from "@/lib/utils/recommendations";
import { BookOpen, Film, Tv, Calendar } from "lucide-react";

const availableGuides = Object.keys(watchOrderGuides);

export function WatchOrderGuide() {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);

  const guide = selectedGuide ? watchOrderGuides[selectedGuide] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panduan Urutan Menonton</CardTitle>
        <CardDescription>
          Panduan untuk seri anime kompleks dengan banyak installment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedGuide ? (
          <div className="grid gap-2 md:grid-cols-2">
            {availableGuides.map((guideKey) => (
              <Button
                key={guideKey}
                variant="outline"
                className="justify-start capitalize"
                onClick={() => setSelectedGuide(guideKey)}
              >
                {guideKey === "fate" ? "Fate Series" : guideKey === "monogatari" ? "Monogatari Series" : guideKey}
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize">
                {selectedGuide === "fate" ? "Fate Series" : selectedGuide === "monogatari" ? "Monogatari Series" : selectedGuide}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedGuide(null)}>
                Kembali
              </Button>
            </div>
            <div className="space-y-3">
              {guide?.map((item) => {
                const Icon = item.type === "movie" ? Film : item.type === "ova" || item.type === "special" ? Tv : BookOpen;
                return (
                  <div
                    key={item.order}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {item.order}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">({item.year})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="capitalize">{item.type}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

