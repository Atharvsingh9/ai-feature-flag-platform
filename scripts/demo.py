#!/usr/bin/env python3
"""
Automated Demo Script for AI Feature Flag Platform.

This script demonstrates the full platform workflow:
  1. Start services (assumes docker compose up is running)
  2. Create a feature flag
  3. Start rollout at 1%
  4. Generate Normal Demo traffic
  5. Check quality metrics
  6. Generate Bad Demo traffic to degrade quality
  7. Trigger automatic rollback
  8. Show dashboard state

Usage:
    python scripts/demo.py

Prerequisites:
    docker compose up -d    (PostgreSQL + Redis + Backend running)
"""

from __future__ import annotations

import http.client
import json
import sys
import time
import urllib.request
import urllib.error
from typing import Any

BASE_URL = "http://localhost:8000"


def request(
    method: str,
    path: str,
    body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "detail": e.read().decode()}
    except urllib.error.URLError as e:
        print(f"  [ERROR] Cannot reach {url}: {e.reason}")
        return {"error": str(e.reason)}
    except (ConnectionError, TimeoutError) as e:
        print(f"  [ERROR] Connection failed: {e}")
        return {"error": str(e)}


def print_step(step: int, title: str) -> None:
    print()
    print("=" * 60)
    print(f"  Step {step}: {title}")
    print("=" * 60)


def wait_for_backend(max_retries: int = 10) -> bool:
    print("Waiting for backend...")
    for i in range(max_retries):
        result = request("GET", "/")
        if result.get("status") == "healthy" or "service" in result:
            print("  Backend is ready.")
            return True
        print(f"  Attempt {i + 1}/{max_retries}...")
        time.sleep(2)
    print("  [ERROR] Backend not reachable.")
    return False


def main() -> None:
    print()
    print("╔══════════════════════════════════════════════════════╗")
    print("║   AI Feature Flag Platform — Automated Demo         ║")
    print("╚══════════════════════════════════════════════════════╝")

    if not wait_for_backend():
        sys.exit(1)

    # Step 1: Reset demo to clean state
    print_step(1, "Reset Demo")
    result = request("POST", "/demo/reset")
    print(f"  Result: {result.get('status', 'N/A')}")
    print(f"  Message: {result.get('message', 'N/A')}")

    time.sleep(1)

    # Step 2: Check demo status
    print_step(2, "Check Demo Status")
    status = request("GET", "/demo/status")
    print(f"  Flag: {status.get('flagName', 'N/A')}")
    print(f"  Status: {status.get('status', 'N/A')}")
    print(f"  Rollout: {status.get('rolloutPercentage', 0)}%")

    # Step 3: Start rollout at 1%
    print_step(3, "Start Rollout at 1%")
    status = request("GET", "/demo/status")
    flag_id = status.get("flagId")
    if flag_id:
        result = request(
            "POST",
            f"/flags/{flag_id}/rollout",
            {
                "percentage": 1,
                "actor": "demo-script",
                "reason": "Starting automated demo rollout",
            },
        )
        print(f"  Flag status: {result.get('status', 'N/A')}")
        print(f"  Rollout: {result.get('rollout_percentage', 0)}%")
    else:
        print("  [INFO] No flag ID yet. Creating flag via generate call...")
        request("POST", "/demo/generate", {"goal": "professional"})
        status = request("GET", "/demo/status")
        flag_id = status.get("flagId")
        if flag_id:
            result = request(
                "POST",
                f"/flags/{flag_id}/rollout",
                {
                    "percentage": 1,
                    "actor": "demo-script",
                    "reason": "Starting automated demo rollout",
                },
            )
            print(f"  Flag status: {result.get('status', 'N/A')}")
            print(f"  Rollout: {result.get('rollout_percentage', 0)}%")

    time.sleep(1)

    # Step 4: Generate Normal Demo traffic
    print_step(4, "Generate Normal Demo Traffic")
    goals = ["professional", "friendly", "marketing", "apology", "followup"]
    for i in range(10):
        goal = goals[i % len(goals)]
        result = request("POST", "/demo/generate", {"goal": goal, "userId": f"demo-auto-{i}"})
        subject = result.get("subject", "(no subject)")[:50]
        variant = result.get("metadata", {}).get("variant", "N/A")
        print(f"  [{i + 1}/10] Goal={goal:15s} Variant={variant:12s} Subject={subject}")
        time.sleep(0.5)

    # Step 5: Check quality metrics
    print_step(5, "Check Quality Metrics")
    status = request("GET", "/demo/status")
    print(f"  Total Evaluations: {status.get('totalEvaluations', 0)}")
    print(f"  Average Quality:   {status.get('averageQuality', 0):.2f}")
    print(f"  Current Variant:   {status.get('currentVariant', 'N/A')}")
    print(f"  Rollout:           {status.get('rolloutPercentage', 0)}%")

    # Step 6: Advance rollout to 25%
    print_step(6, "Advance Rollout to 25%")
    status = request("GET", "/demo/status")
    flag_id = status.get("flagId")
    if flag_id:
        result = request(
            "POST",
            f"/flags/{flag_id}/rollout",
            {
                "percentage": 25,
                "actor": "demo-script",
                "reason": "Advancing rollout in demo",
            },
        )
        print(f"  Rollout now at: {result.get('rollout_percentage', 0)}%")
    else:
        print("  [ERROR] No flag ID found.")

    time.sleep(1)

    # Step 7: Generate Bad Demo traffic
    print_step(7, "Generate Bad Demo Traffic (Intentional Quality Degradation)")
    for i in range(10):
        goal = goals[i % len(goals)]
        result = request(
            "POST",
            "/demo/bad-generate",
            {"goal": goal, "userId": f"bad-demo-{i}"},
        )
        variant = result.get("metadata", {}).get("variant", "N/A")
        print(f"  [{i + 1}/10] Goal={goal:15s} Bad Demo triggered")
        time.sleep(0.5)

    # Step 8: Check updated quality metrics
    print_step(8, "Check Updated Quality Metrics")
    status = request("GET", "/demo/status")
    print(f"  Total Evaluations: {status.get('totalEvaluations', 0)}")
    print(f"  Average Quality:   {status.get('averageQuality', 0):.2f}")
    print(f"  Flag Status:       {status.get('status', 'N/A')}")
    print(f"  Rollout:           {status.get('rolloutPercentage', 0)}%")

    # Step 9: Verify rollback can be triggered
    print_step(9, "Verify Automatic Rollback")
    if status.get("averageQuality", 5.0) < 3.0 or status.get("status") == "rolled_back":
        print("  Quality has degraded significantly.")
        print("  In production, automatic rollback would trigger.")
        print("  Visit http://localhost:5173/demo to see the dashboard.")
    else:
        print("  Quality still within acceptable range.")
        print("  (Run more bad-generate calls to force degradation)")

    # Step 10: Summary
    print_step(10, "Demo Summary")
    final_status = request("GET", "/demo/status")
    print(f"  Flag:           {final_status.get('flagName', 'N/A')}")
    print(f"  Status:         {final_status.get('status', 'N/A')}")
    print(f"  Rollout:        {final_status.get('rolloutPercentage', 0)}%")
    print(f"  Variant:        {final_status.get('currentVariant', 'N/A')}")
    print(f"  Evaluations:    {final_status.get('totalEvaluations', 0)}")
    print(f"  Average Quality: {final_status.get('averageQuality', 0):.2f}")
    print()
    print("  Dashboard:     http://localhost:5173/demo")
    print("  API Docs:      http://localhost:8000/docs")
    print("  Rollouts:      http://localhost:5173/rollouts")
    print("  Quality:       http://localhost:5173/quality")
    print()

    # Reset the demo so it can be re-run
    print("Resetting demo for next run...")
    request("POST", "/demo/reset")
    print("Demo complete. Ready for re-run.")


if __name__ == "__main__":
    main()
