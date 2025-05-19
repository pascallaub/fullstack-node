#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "### Start: Swarm VM Teardown ###"

VM_NAMES=("manager" "worker1" "worker2" "worker3")

# 1. Stoppe VMs
for vm_name in "${VM_NAMES[@]}"; do
    echo ">>> Stoppe VM: $vm_name..."
    # Stoppt die VM, falls sie existiert und läuft. Ignoriert Fehler, falls bereits gestoppt oder nicht existent.
    multipass stop "$vm_name" || echo "VM $vm_name ist möglicherweise bereits gestoppt oder existiert nicht. Fahre fort..."
done

# 2. Lösche VMs
for vm_name in "${VM_NAMES[@]}"; do
    echo ">>> Lösche VM: $vm_name..."
    # Löscht die VM, falls sie existiert. Ignoriert Fehler, falls bereits gelöscht.
    multipass delete "$vm_name" || echo "VM $vm_name ist möglicherweise bereits gelöscht oder existiert nicht. Fahre fort..."
done

# 3. Bereinige gelöschte VMs (gibt Speicherplatz frei)
echo ">>> Bereinige alle wiederherstellbaren gelöschten VMs..."
multipass purge

echo ">>> Alle angegebenen Swarm VMs wurden zum Stoppen, Löschen und Bereinigen angefordert."
echo ">>> Finaler VM Status:"
multipass list

echo "### Ende: Swarm VM Teardown ###"