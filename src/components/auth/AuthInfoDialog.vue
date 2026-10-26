<script setup lang="ts">

import { Info } from 'lucide-vue-next'

import {
  Badge,
} from '@/components/ui/badge'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

</script>

<template>

  <Dialog>

    <DialogTrigger as-child>

      <button class="info-button">

        <Badge
          class="w-fit"
          variant="secondary"
        >
          v0.1.0
        </Badge>

        <Info :size="16" />

      </button>

    </DialogTrigger>

    <DialogContent class="info-dialog">

      <DialogHeader>

        <DialogTitle class="info-title">
          About <span>Tecta</span>
        </DialogTitle>

        <DialogDescription class="info-description">
          A secure messaging platform focused on
          privacy and end-to-end encryption.
        </DialogDescription>

      </DialogHeader>

      <div class="info-content">

        <div class="info-section">

          <h3>
            Privacy first
          </h3>

          <p>
            Tecta is designed around secure communication
            and protection of user data.
          </p>

        </div>

        <div class="info-section">

          <h3>
            End-to-end encryption
          </h3>

          <p>
            Messages are designed to be encrypted on
            the sender's device and decrypted only by
            authorized devices.
          </p>

        </div>

        <div class="info-section">

          <h3>
            Open project
          </h3>

          <p>
            Tecta is a university course project developed
            by two students of the Technical University of Moldova.
          </p>

          <div class="roles">

            <div class="member">

              <Badge variant="secondary">
                Pryima Oleksandr
              </Badge>

              <Badge class="bg-white text-black">
                Lead Developer
              </Badge>

            </div>

            <p>and</p>

            <div class="member">

              <Badge variant="secondary">
                Kharchenko Maksym
              </Badge>

              <Badge class="bg-white text-black">
                QA Engineer
              </Badge>

            </div>

          </div>

          <br />

          <p>
            from
            <Badge variant="outline">
              SI-256
            </Badge>
          </p>

        </div>

        <div class="info-footer">

          <span>Tecta</span>
          <span>2026</span>

        </div>

      </div>

    </DialogContent>

  </Dialog>

</template>